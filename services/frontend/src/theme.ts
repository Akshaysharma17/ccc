import { createTheme } from '@mui/material/styles';

export const STATUS_COLORS = {
  Approved: '#4caf50',
  Submitted: '#2196f3',
  Prepared: '#ff9800',
  Pending: '#9e9e9e',
} as const;

export const theme = createTheme({
  palette: {
    primary: { main: '#1565c0' },
    secondary: { main: '#ff9800' },
    background: { default: '#f0f2f5', paper: '#ffffff' },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiAccordion: {
      defaultProps: { slotProps: { transition: { unmountOnExit: true } } },
      styleOverrides: {
        root: {
          borderRadius: '12px !important',
          marginBottom: 8,
          '&:before': { display: 'none' },
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: { minHeight: 56, '&.Mui-expanded': { minHeight: 56 } },
        content: { '&.Mui-expanded': { margin: '12px 0' } },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
      },
    },
  },
});
