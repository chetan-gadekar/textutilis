import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    LinearProgress,
    Paper,
    IconButton,
    Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import uploadService from '../../services/uploadService';

const FileUpload = ({ onUploadSuccess, accept = "*", label = "Upload File", folder = "uploads" }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                setError("File size too large (max 10MB)");
                return;
            }
            setFile(selectedFile);
            setError(null);
            setSuccess(false);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setUploading(true);
            setError(null);

            const response = await uploadService.uploadFile(file);

            if (response.success) {
                setSuccess(true);
                onUploadSuccess(response.data.url, response.data.fileName);
            } else {
                setError(response.message || "Upload failed");
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "An error occurred during upload");
        } finally {
            setUploading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setUploading(false);
        setError(null);
        setSuccess(false);
    };

    return (
        <Box sx={{ width: '100%', mb: 2 }}>
            {!file ? (
                <Box
                    sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#f9f9f9', borderColor: '#999' }
                    }}
                    component="label"
                >
                    <input
                        type="file"
                        hidden
                        accept={accept}
                        onChange={handleFileChange}
                    />
                    <CloudUploadIcon sx={{ fontSize: 40, color: '#666', mb: 1 }} />
                    <Typography>{label}</Typography>
                    <Typography variant="caption" color="textSecondary">
                        Click to browse
                    </Typography>
                </Box>
            ) : (
                <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <DescriptionIcon color="primary" />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap>
                            {file.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            {(file.size / 1024).toFixed(1)} KB
                        </Typography>
                        {uploading && <LinearProgress sx={{ mt: 1 }} />}
                    </Box>
                    {!uploading && !success && (
                        <Button size="small" variant="contained" onClick={handleUpload}>
                            Upload
                        </Button>
                    )}
                    {!uploading && (
                        <IconButton size="small" onClick={reset}>
                            <CloseIcon />
                        </IconButton>
                    )}
                </Paper>
            )}
            {error && (
                <Alert severity="error" sx={{ mt: 1 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mt: 1 }}>
                    File uploaded successfully!
                </Alert>
            )}
        </Box>
    );
};

export default FileUpload;
