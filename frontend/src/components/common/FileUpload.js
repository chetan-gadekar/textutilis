import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    LinearProgress,
    Paper,
    IconButton,
    Tooltip
} from '@mui/material';
import notify from '../../utils/notify';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import uploadService from '../../services/uploadService';

const FileUpload = ({ onUploadSuccess, accept = "*", label = "Upload File", folder = "uploads", multiple = false }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);

        if (selectedFiles.length > 0) {
            // Check sizes
            for (let f of selectedFiles) {
                if (f.size > 10 * 1024 * 1024) { // 10MB limit
                    notify.error(`File size too large: ${f.name} (max 10MB)`);
                    return;
                }
            }

            if (multiple) {
                setFiles(prev => [...prev, ...selectedFiles]);
            } else {
                setFiles([selectedFiles[0]]);
            }

            setSuccess(false);
            setUploadProgress(0);
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        try {
            setUploading(true);
            setSuccess(false);

            let uploadedCount = 0;

            for (const currentFile of files) {
                const response = await uploadService.uploadFile(currentFile);

                if (response.success) {
                    onUploadSuccess(response.data.url, response.data.fileName);
                    uploadedCount++;
                    setUploadProgress((uploadedCount / files.length) * 100);
                } else {
                    throw new Error(response.message || `Upload failed for ${currentFile.name}`);
                }
            }

            setSuccess(true);
            // Clear files after successful upload if multiple? Maybe wait for reset.
            if (!multiple) {
                setFiles([]);
            } else {
                setFiles([]);
            }

            notify.success(files.length > 1 ? 'Files uploaded successfully!' : 'File uploaded successfully!');
        } catch (err) {
            notify.error(err.response?.data?.message || err.message || "An error occurred during upload");
        } finally {
            setUploading(false);
        }
    };

    const removeSelectedFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const reset = () => {
        setFiles([]);
        setUploading(false);
        // Removed orphaned setError(null)
        setSuccess(false);
    };

    return (
        <Box sx={{ width: '100%', mb: 2 }}>
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
                    multiple={multiple}
                    onChange={handleFileChange}
                />
                <CloudUploadIcon sx={{ fontSize: 40, color: '#666', mb: 1 }} />
                <Typography>{label}</Typography>
                <Typography variant="caption" color="textSecondary">
                    Click to browse {multiple && "(Multiple allowed)"}
                </Typography>
            </Box>

            {files.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {files.map((file, index) => (
                        <Paper key={index} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <DescriptionIcon color="primary" />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" noWrap>
                                    {file.name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {(file.size / 1024).toFixed(1)} KB
                                </Typography>
                            </Box>
                            {!uploading && !success && (
                                <Tooltip title="Remove File">
                                    <IconButton size="small" onClick={() => removeSelectedFile(index)} color="error">
                                        <CloseIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Paper>
                    ))}

                    {uploading && <LinearProgress variant="determinate" value={uploadProgress || 0} sx={{ mt: 1, mb: 1 }} />}

                    {!uploading && !success && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                            <Button size="small" variant="contained" onClick={handleUpload}>
                                Upload {files.length > 1 ? `All(${files.length})` : ''}
                            </Button>
                        </Box>
                    )}
                </Box>
            )}
            {/* Legacy alerts removed in favor of premium toasts */}
        </Box>
    );
};

export default FileUpload;
