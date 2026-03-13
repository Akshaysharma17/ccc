import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Chip, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { SectionGroup } from '../../types';
import KKSAccordion from './KKSAccordion';
import ReportDialog from './ReportDialog';

interface SectionAccordionProps {
  section: SectionGroup;
}

export default function SectionAccordion({ section }: SectionAccordionProps) {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
            <FolderIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
              {section.section_number}{section.section_name ? ` — ${section.section_name}` : ''}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Button
              size="small"
              variant="outlined"
              startIcon={<AssessmentIcon />}
              onClick={(e) => { e.stopPropagation(); setReportOpen(true); }}
              sx={{ mr: 1, textTransform: 'none', borderRadius: 2 }}
            >
              Report
            </Button>
            <Chip label={`${section.count} items`} size="small" color="primary" />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {section.kks_groups.map((kks) => (
            <KKSAccordion key={kks.kks_code} group={kks} />
          ))}
        </AccordionDetails>
      </Accordion>

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        sectionNumber={section.section_number}
        sectionName={section.section_name}
      />
    </>
  );
}
