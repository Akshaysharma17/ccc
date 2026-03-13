import React from 'react';
import {
  Box, TextField, FormControl, InputLabel, Select, MenuItem,
  InputAdornment, SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export interface Filters {
  search: string;
  department: string;
  status: string;
  priority: string;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  departments: string[];
  statuses: string[];
  priorities: string[];
}

export default function FilterBar({ filters, onChange, departments, statuses, priorities }: FilterBarProps) {
  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const handleSelect = (field: keyof Filters) => (e: SelectChangeEvent) => {
    onChange({ ...filters, [field]: e.target.value });
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <TextField
        placeholder="Search CCC, KKS, description..."
        value={filters.search}
        onChange={handleText}
        size="small"
        sx={{ minWidth: 260, flex: 1 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start"><SearchIcon /></InputAdornment>
            ),
          },
        }}
      />

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Department</InputLabel>
        <Select value={filters.department} label="Department" onChange={handleSelect('department')}>
          <MenuItem value="">All</MenuItem>
          {departments.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Status</InputLabel>
        <Select value={filters.status} label="Status" onChange={handleSelect('status')}>
          <MenuItem value="">All</MenuItem>
          {statuses.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Priority</InputLabel>
        <Select value={filters.priority} label="Priority" onChange={handleSelect('priority')}>
          <MenuItem value="">All</MenuItem>
          {priorities.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
        </Select>
      </FormControl>
    </Box>
  );
}
