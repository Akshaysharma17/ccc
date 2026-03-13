import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Alert, Divider,
  IconButton, TextField,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { SectionReport, ReportItem, ReportCategory, AnnotationsMap } from '../../types';
import { fetchSectionReport, fetchAnnotations, saveAnnotation } from '../../services/dashboardService';

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  sectionNumber: string;
  sectionName: string;
}

interface GroupedEntry {
  personName: string;
  items: ReportItem[];
}

function groupItemsByPerson(items: ReportItem[], annotations: AnnotationsMap): GroupedEntry[] {
  const groups: Map<string, ReportItem[]> = new Map();
  const unnamed: ReportItem[] = [];

  for (const item of items) {
    const name = (annotations[item.serial_number]?.person_name || '').trim();
    if (name) {
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name)!.push(item);
    } else {
      unnamed.push(item);
    }
  }

  const result: GroupedEntry[] = [];
  // Named groups first
  for (const [personName, groupItems] of groups) {
    result.push({ personName, items: groupItems });
  }
  // Unnamed items individually
  for (const item of unnamed) {
    result.push({ personName: '', items: [item] });
  }
  return result;
}

export default function ReportDialog({ open, onClose, sectionNumber, sectionName }: ReportDialogProps) {
  const [report, setReport] = useState<SectionReport | null>(null);
  const [annotations, setAnnotations] = useState<AnnotationsMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    Promise.all([fetchSectionReport(sectionNumber), fetchAnnotations(sectionNumber)])
      .then(([reportData, annotationsData]) => {
        setReport(reportData);
        setAnnotations(annotationsData);
      })
      .catch((err) => setError(err.message || 'Failed to load report'))
      .finally(() => setLoading(false));
  }, [open, sectionNumber]);

  useEffect(() => {
    const timers = saveTimers.current;
    return () => { Object.values(timers).forEach(clearTimeout); };
  }, []);

  const handleAnnotationChange = useCallback(
    (serialNumber: string, field: 'person_name' | 'remarks', value: string) => {
      setAnnotations((prev) => {
        const updated = {
          ...prev,
          [serialNumber]: {
            person_name: prev[serialNumber]?.person_name || '',
            remarks: prev[serialNumber]?.remarks || '',
            [field]: value,
          },
        };

        const timerKey = serialNumber;
        if (saveTimers.current[timerKey]) {
          clearTimeout(saveTimers.current[timerKey]);
        }
        saveTimers.current[timerKey] = setTimeout(() => {
          const latest = updated[serialNumber];
          setSaving(true);
          saveAnnotation(sectionNumber, serialNumber, latest.person_name, latest.remarks)
            .finally(() => setTimeout(() => setSaving(false), 500));
          delete saveTimers.current[timerKey];
        }, 800);

        return updated;
      });
    },
    [sectionNumber],
  );

  // Pre-compute grouped categories
  const groupedCategories = useMemo(() => {
    if (!report) return [];
    return report.categories.map((cat) => ({
      ...cat,
      groups: groupItemsByPerson(cat.items, annotations),
    }));
  }, [report, annotations]);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${sectionNumber} - ${sectionName} CCC Status Report</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #1a1a1a; font-size: 12px; }
            h2 { font-size: 15px; text-align: center; margin-bottom: 4px; }
            .date { font-size: 10px; text-align: center; color: #666; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #aaa; padding: 4px 8px; text-align: left; vertical-align: top; }
            th { background: #ddd; font-weight: 600; }
            .cat td { background: #e3f2fd; font-weight: 600; }
            .person-first td { background: #f5f5f5; }
            input, textarea { border: none; background: transparent; font: inherit; width: 100%; resize: none; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  const renderCategoryRows = (cat: ReportCategory & { groups: GroupedEntry[] }) => {
    const rows: React.ReactNode[] = [];
    const isSummaryOnly = cat.sno <= 2; // Total and Submitted are count-only

    // Category header
    rows.push(
      <TableRow key={`cat-${cat.sno}`} className="cat" sx={{ bgcolor: '#e3f2fd' }}>
        <TableCell sx={{ fontWeight: 600 }}>{cat.sno}</TableCell>
        <TableCell sx={{ fontWeight: 600 }}>{cat.title}</TableCell>
        <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>{cat.count}</TableCell>
        <TableCell />
        <TableCell />
      </TableRow>
    );

    // Only render detail rows for categories 3-6
    if (isSummaryOnly) return rows;

    // Grouped items
    for (const group of cat.groups) {
      group.items.forEach((item, idx) => {
        const ann = annotations[item.serial_number] || { person_name: '', remarks: '' };
        const isFirst = idx === 0;
        const hasName = group.personName.length > 0;

        rows.push(
          <TableRow
            key={`${cat.sno}-${item.serial_number}`}
            className={isFirst && hasName ? 'person-first' : ''}
            sx={isFirst && hasName ? { bgcolor: '#fafafa' } : {}}
          >
            <TableCell />
            {/* Description: name textbox */}
            <TableCell sx={{ p: 0.5 }}>
              {isFirst ? (
                <TextField
                  size="small"
                  variant="standard"
                  placeholder="Enter name"
                  value={ann.person_name}
                  onChange={(e) => handleAnnotationChange(item.serial_number, 'person_name', e.target.value)}
                  fullWidth
                  slotProps={{
                    input: {
                      disableUnderline: true,
                      sx: {
                        fontSize: '0.85rem', px: 0.5,
                        fontWeight: hasName ? 600 : 400,
                      },
                    },
                  }}
                />
              ) : (
                <TextField
                  size="small"
                  variant="standard"
                  placeholder="Name"
                  value={ann.person_name}
                  onChange={(e) => handleAnnotationChange(item.serial_number, 'person_name', e.target.value)}
                  fullWidth
                  slotProps={{
                    input: {
                      disableUnderline: true,
                      sx: { fontSize: '0.8rem', px: 0.5, color: '#999' },
                    },
                  }}
                />
              )}
            </TableCell>
            {/* Nos: count on first row of named group */}
            <TableCell sx={{ textAlign: 'center', fontSize: '0.85rem' }}>
              {isFirst && hasName ? group.items.length : ''}
            </TableCell>
            {/* Status = KKS code (from column AT mapping) */}
            <TableCell sx={{ fontSize: '0.85rem' }}>
              {item.ccc_status}
            </TableCell>
            {/* Remarks */}
            <TableCell sx={{ p: 0.5 }}>
              <TextField
                size="small"
                variant="standard"
                placeholder="Remarks"
                value={ann.remarks}
                onChange={(e) => handleAnnotationChange(item.serial_number, 'remarks', e.target.value)}
                fullWidth
                multiline
                maxRows={3}
                slotProps={{
                  input: {
                    disableUnderline: true,
                    sx: { fontSize: '0.82rem', px: 0.5 },
                  },
                }}
              />
            </TableCell>
          </TableRow>
        );
      });
    }

    return rows;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pr: 6 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">
            {sectionNumber} — {sectionName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            CCC Status Abstract Report
            {saving && (
              <Box component="span" sx={{ ml: 1.5, color: 'success.main', fontSize: '0.75rem' }}>
                <CheckCircleIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.3 }} />
                Saved
              </Box>
            )}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {report && !loading && (
          <Box ref={printRef}>
            <h2>
              <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', mb: 0.5 }}>
                {report.section_name} — {report.kks_codes.join(', ')} CCC Status
              </Typography>
            </h2>
            <div className="date">
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
                {new Date().toLocaleDateString()}
              </Typography>
            </div>

            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mb: 3, flexWrap: 'wrap' }}>
              {[
                { label: 'Total', value: report.total, color: '#1565c0' },
                { label: 'Submitted', value: report.summary.submitted, color: '#2196f3' },
                { label: 'Pending', value: report.summary.pending, color: '#ff9800' },
                { label: 'Approved', value: report.summary.approved, color: '#4caf50' },
                { label: 'In Process', value: report.summary.in_process, color: '#9c27b0' },
                { label: 'Returned', value: report.summary.returned, color: '#f44336' },
              ].map((s) => (
                <Box key={s.label} sx={{ textAlign: 'center', minWidth: 65 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: s.color }}>{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#e8eaf6' }}>
                    <TableCell sx={{ fontWeight: 700, width: 45 }}>S.No</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 180 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 50, textAlign: 'center' }}>Nos</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 220 }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupedCategories.map((cat) => renderCategoryRows(cat))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={!report || loading}
        >
          Print Report
        </Button>
      </DialogActions>
    </Dialog>
  );
}
