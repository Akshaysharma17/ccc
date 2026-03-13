import React from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Divider,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { CCCRecord } from '../../types';
import StatusChip from './StatusChip';

interface CCCDetailCardProps {
  record: CCCRecord;
}

function BoolIndicator({ value }: { value: string | null }) {
  if (!value || value.toLowerCase() === 'no' || value === '-') {
    return <CloseIcon sx={{ fontSize: 18, color: '#e57373' }} />;
  }
  return <CheckIcon sx={{ fontSize: 18, color: '#4caf50' }} />;
}

export default function CCCDetailCard({ record }: CCCDetailCardProps) {
  const formats = [
    { label: 'Format 1', ...record.format_1 },
    { label: 'Format 2', ...record.format_2 },
    { label: 'Format 3', ...record.format_3 },
    { label: 'Format 4', ...record.format_4 },
    { label: 'Format 5', ...record.format_5 },
  ];

  const teams = [
    { label: 'Engineering', value: record.team_handover.engineering },
    { label: 'Procurement', value: record.team_handover.procurement },
    { label: 'Quality', value: record.team_handover.quality },
    { label: 'Civil', value: record.team_handover.civil },
    { label: 'Mechanical', value: record.team_handover.mechanical },
    { label: 'Electrical', value: record.team_handover.electrical },
    { label: 'C&I', value: record.team_handover.c_and_i },
  ];

  return (
    <Box sx={{ p: 2, bgcolor: '#fafbfc', borderRadius: 2 }}>
      {/* Header row */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
        <StatusChip status={record.ccc_status} size="medium" />
        {record.part_or_full && (
          <Chip label={record.part_or_full} size="small" variant="outlined" />
        )}
        {record.department && (
          <Chip label={record.department} size="small" color="primary" variant="outlined" />
        )}
        {record.priority_type && (
          <Chip label={record.priority_type} size="small" color="secondary" variant="outlined" />
        )}
        {record.target_date && (
          <Typography variant="body2" color="text.secondary">
            Target: <strong>{record.target_date}</strong>
          </Typography>
        )}
      </Box>

      {/* Formats table */}
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Formats</Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Format</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Applicable</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Cleared</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formats.map((f) => (
              <TableRow key={f.label}>
                <TableCell>{f.label}</TableCell>
                <TableCell align="center"><BoolIndicator value={f.applicable} /></TableCell>
                <TableCell align="center"><BoolIndicator value={f.cleared} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Team Handover */}
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Team Handover</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {teams.map((t) => (
          <Chip
            key={t.label}
            label={t.label}
            size="small"
            icon={<BoolIndicator value={t.value} />}
            variant="outlined"
            sx={{ borderColor: t.value && t.value.toLowerCase() !== 'no' && t.value !== '-' ? '#4caf50' : '#e0e0e0' }}
          />
        ))}
      </Box>

      {/* Reports */}
      {(record.hd_report || record.erection_report_1 || record.erection_report_2) && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Reports</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {record.hd_report && (
              <Typography variant="body2">HD: {record.hd_report}</Typography>
            )}
            {record.erection_report_1 && (
              <Typography variant="body2">Erection 1: {record.erection_report_1}</Typography>
            )}
            {record.erection_report_2 && (
              <Typography variant="body2">Erection 2: {record.erection_report_2}</Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
