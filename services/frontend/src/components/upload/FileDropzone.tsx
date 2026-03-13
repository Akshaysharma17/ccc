import React, { useCallback, useState } from 'react';
import { Box, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export default function FileDropzone({ onFileSelected, disabled }: FileDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      onFileSelected(file);
    }
  }, [onFileSelected, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  }, [disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.xlsx')) {
      onFileSelected(file);
    }
    e.target.value = '';
  }, [onFileSelected]);

  return (
    <Box
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragOver(false)}
      sx={{
        border: '2px dashed',
        borderColor: dragOver ? 'primary.main' : '#ccc',
        borderRadius: 3,
        p: 6,
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        bgcolor: dragOver ? 'action.hover' : 'background.paper',
        transition: 'all 0.2s',
        opacity: disabled ? 0.6 : 1,
        '&:hover': disabled ? {} : { borderColor: 'primary.light', bgcolor: 'action.hover' },
      }}
      onClick={() => {
        if (!disabled) document.getElementById('file-input')?.click();
      }}
    >
      <input id="file-input" type="file" accept=".xlsx" hidden onChange={handleFileInput} />
      <CloudUploadIcon sx={{ fontSize: 64, color: dragOver ? 'primary.main' : '#bbb', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Drag & drop your Excel file here
      </Typography>
      <Typography variant="body2" color="text.secondary">
        or click to browse. Only .xlsx files are accepted (max 50MB)
      </Typography>
    </Box>
  );
}
