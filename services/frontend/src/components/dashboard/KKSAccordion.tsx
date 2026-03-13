import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { KKSGroup } from '../../types';
import CCCAccordion from './CCCAccordion';

interface KKSAccordionProps {
  group: KKSGroup;
}

export default function KKSAccordion({ group }: KKSAccordionProps) {
  return (
    <Accordion
      sx={{
        bgcolor: '#f8f9fb',
        border: '1px solid #e0e3e8',
        boxShadow: 'none !important',
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.dark' }}>
            {group.kks_code}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }} noWrap>
            {group.kks_description}
          </Typography>
          <Chip label={`${group.count} CCCs`} size="small" variant="outlined" color="primary" />
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {group.cccs.map((ccc, idx) => (
          <CCCAccordion key={ccc.ccc_number_full || idx} record={ccc} />
        ))}
      </AccordionDetails>
    </Accordion>
  );
}
