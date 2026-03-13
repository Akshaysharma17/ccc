import React from 'react';
import { Chip } from '@mui/material';
import { STATUS_COLORS } from '../../theme';

interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium';
}

export default function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.Pending;

  return (
    <Chip
      label={status}
      size={size}
      sx={{
        bgcolor: color,
        color: '#fff',
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.85rem',
      }}
    />
  );
}
