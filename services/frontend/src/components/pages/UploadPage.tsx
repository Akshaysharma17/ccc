import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Alert, LinearProgress, Paper, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FileDropzone from '../upload/FileDropzone';
import { uploadExcel } from '../../services/uploadService';

export default function UploadPage() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ status: string; records_inserted: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const res = await uploadExcel(file);
      setResult(res);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Upload failed';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Upload Excel File</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Upload an Excel file containing the "CCC status Master" sheet.
        This will replace all existing data.
      </Typography>

      <Paper sx={{ p: 4, mb: 3 }}>
        <FileDropzone onFileSelected={handleFile} disabled={uploading} />
        {uploading && <LinearProgress sx={{ mt: 3, borderRadius: 1 }} />}
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {result && (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/')}>
              View Dashboard
            </Button>
          }
        >
          Successfully imported {result.records_inserted} records.
        </Alert>
      )}
    </Box>
  );
}
