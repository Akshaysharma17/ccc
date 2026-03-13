import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import EditNoteIcon from '@mui/icons-material/EditNote';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { DashboardStats } from '../../types';

interface SummaryCardsProps {
  stats: DashboardStats;
}

const cards = [
  { key: 'total', label: 'Total CCCs', color: '#1565c0', icon: AssignmentIcon, getValue: (s: DashboardStats) => s.total },
  { key: 'approved', label: 'Approved', color: '#4caf50', icon: CheckCircleIcon, getValue: (s: DashboardStats) => s.by_status['Approved'] || 0 },
  { key: 'submitted', label: 'Submitted', color: '#2196f3', icon: SendIcon, getValue: (s: DashboardStats) => s.by_status['Submitted'] || 0 },
  { key: 'prepared', label: 'Prepared', color: '#ff9800', icon: EditNoteIcon, getValue: (s: DashboardStats) => s.by_status['Prepared'] || 0 },
  { key: 'pending', label: 'Pending', color: '#9e9e9e', icon: HourglassEmptyIcon, getValue: (s: DashboardStats) => s.by_status['Pending'] || 0 },
];

export default function SummaryCards({ stats }: SummaryCardsProps) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Grid key={card.key} size={{ xs: 6, sm: 4, md: 2.4 }}>
            <Card sx={{
              background: `linear-gradient(135deg, ${card.color}15, ${card.color}08)`,
              border: `1px solid ${card.color}30`,
            }}>
              <CardContent sx={{ textAlign: 'center', py: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ mb: 1 }}>
                  <Icon sx={{ fontSize: 32, color: card.color }} />
                </Box>
                <Typography variant="h4" sx={{ color: card.color, fontWeight: 700 }}>
                  {card.getValue(stats)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {card.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
