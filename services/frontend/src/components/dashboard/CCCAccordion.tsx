import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CCCRecord } from '../../types';
import StatusChip from './StatusChip';
import CCCDetailCard from './CCCDetailCard';

interface CCCAccordionProps {
  record: CCCRecord;
}

export default function CCCAccordion({ record }: CCCAccordionProps) {
  const label = record.ccc_number_full || record.active_ccc_number || 'Unknown CCC';

  return (
    <Accordion
      sx={{
        bgcolor: '#ffffff',
        border: '1px solid #e8eaed',
        boxShadow: 'none !important',
        '&:hover': { borderColor: '#c0c4cc' },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.82rem' }}>
            {label}
          </Typography>
          {record.ccc_description && (
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1, minWidth: 100 }} noWrap>
              {record.ccc_description}
            </Typography>
          )}
          <StatusChip status={record.ccc_status} />
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        <CCCDetailCard record={record} />
      </AccordionDetails>
    </Accordion>
  );
}
