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
import ImageIcon from '@mui/icons-material/Image';
import uploadService from '../../services/uploadService';

/**
 * Smart file uploader:
 *  - Images  → Cloudinary  (uploadFile)
 *  - All else → Cloudflare R2 (uploadDocument) with progress tracking
 */
const FileUpload = ({ onUploadSuccess, accept = "*", label = "Upload File", folder = "uploads", multiple = false }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);

        if (selectedFiles.length > 0) {
            // Size limits: 10 MB for images via Cloudinary, 500 MB for docs via R2
            for (let f of selectedFiles) {
                const isImage = f.type.startsWith('image/');
                const limit = isImage ? 10 * 1024 * 1024 : 500 * 1024 * 1024;
                const limitLabel = isImage ? '10 MB' : '500 MB';
                if (f.size > limit) {
                    notify.error(`File "${f.name}" is too large (max ${limitLabel})`);
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
                const isImage = currentFile.type.startsWith('image/');

                let response;
                if (isImage) {
                    // Images → Cloudinary (no real progress, just a spinner)
                    response = await uploadService.uploadFile(currentFile);
                    if (response.success) {
                        onUploadSuccess(response.data.url, response.data.fileName);
                    } else {
                        throw new Error(response.message || `Upload failed for ${currentFile.name}`);
                    }
                } else {
                    // Documents/PPT/PDF → Cloudflare R2 with progress
                    response = await uploadService.uploadDocument(
                        currentFile,
                        (progress) => {
                            // When multiple files, scale progress per-file
                            const base = (uploadedCount / files.length) * 100;
                            const perFile = progress / files.length;
                            setUploadProgress(Math.round(base + perFile));
                        }
                    );
                    if (response.success) {
                        onUploadSuccess(response.data.url, response.data.fileName);
                    } else {
                        throw new Error(response.message || `Upload failed for ${currentFile.name}`);
                    }
                }

                uploadedCount++;
                setUploadProgress(Math.round((uploadedCount / files.length) * 100));
            }

            setSuccess(true);
            setFiles([]);
            notify.success(files.length > 1 ? 'Files uploaded successfully!' : 'File uploaded successfully!');
        } catch (err) {
            notify.error(err.response?.data?.message || err.message || 'An error occurred during upload');
        } finally {
            setUploading(false);
        }
    };

    const removeSelectedFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
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
                    accept={accept}
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
                    {files.map((file, index) => {
                        const isImage = file.type.startsWith('image/');
                        return (
                            <Paper key={index} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                {isImage
                                    ? <ImageIcon color="secondary" />
                                    : <DescriptionIcon color="primary" />
                                }
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" noWrap>
                                        {file.name}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {(file.size / 1024).toFixed(1)} KB &nbsp;&middot;&nbsp;
                                        <span style={{ color: isImage ? '#9c27b0' : '#1976d2', fontWeight: 600 }}>
                                            {isImage ? 'Cloudinary' : 'Cloudflare R2'}
                                        </span>
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
                        );
                    })}

                    {uploading && (
                        <Box sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="textSecondary">
                                    {uploadProgress >= 95 ? 'Finalizing...' : 'Uploading...'}
                                </Typography>
                                <Typography variant="caption" color="primary" fontWeight="bold">
                                    {uploadProgress}%
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={uploadProgress || 0}
                                sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: 'rgba(25, 118, 210, 0.1)',
                                    '& .MuiLinearProgress-bar': { borderRadius: 3 }
                                }}
                            />
                        </Box>
                    )}

                    {!uploading && !success && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                            <Button size="small" variant="contained" onClick={handleUpload}>
                                Upload {files.length > 1 ? `All (${files.length})` : ''}
                            </Button>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default FileUpload;
