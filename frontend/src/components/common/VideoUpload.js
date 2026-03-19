import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    LinearProgress,
    Paper,
    IconButton,
    Alert,
    Tooltip
} from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';
import CloseIcon from '@mui/icons-material/Close';
import uploadService from '../../services/uploadService';

const VideoUpload = ({ onUploadSuccess, label = "Upload Video" }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // 3GB limit for videos (R2 supports larger files)
            if (selectedFile.size > 3 * 1024 * 1024 * 1024) {
                setError("Video file too large (max 3GB)");
                return;
            }
            if (!selectedFile.type.startsWith('video/')) {
                setError("Please select a valid video file");
                return;
            }
            setFile(selectedFile);
            setError(null);
            setSuccess(false);
            setUploadProgress(0);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setUploading(true);
            setError(null);
            setUploadProgress(0);

            const response = await uploadService.uploadVideo(file, (progress) => {
                setUploadProgress(progress);
            });

            if (response.success) {
                setSuccess(true);
                setUploadProgress(100);
                onUploadSuccess(response.data.url, response.data.fileName, 0);
            } else {
                setError(response.message || "Upload failed");
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "An error occurred during video upload");
        } finally {
            setUploading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setUploading(false);
        setUploadProgress(0);
        setError(null);
        setSuccess(false);
    };

    return (
        <Box sx={{ width: '100%', mb: 2 }}>
            {!file ? (
                <Box
                    sx={{
                        border: '2px dashed #1976d2',
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        bgcolor: 'rgba(25, 118, 210, 0.04)',
                        '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.08)', borderColor: '#115293' }
                    }}
                    component="label"
                >
                    <input
                        type="file"
                        hidden
                        accept="video/*"
                        onChange={handleFileChange}
                    />
                    <MovieIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                    <Typography color="primary" fontWeight="medium">{label}</Typography>
                    <Typography variant="caption" color="textSecondary">
                        Max size: 3GB | Formats: MP4, WebM, etc.
                    </Typography>
                </Box>
            ) : (
                <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <MovieIcon color="primary" />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" noWrap fontWeight="bold">
                                {file.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </Typography>
                        </Box>
                        {!uploading && !success && (
                            <Button size="small" variant="contained" onClick={handleUpload}>
                                Upload
                            </Button>
                        )}
                        {!uploading && (
                            <Tooltip title="Remove Video">
                                <IconButton size="small" onClick={reset}>
                                    <CloseIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>

                    {/* Real-time upload progress bar */}
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
                                value={uploadProgress}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: 'rgba(25, 118, 210, 0.1)',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                                    }
                                }}
                            />
                        </Box>
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
                    Video uploaded successfully!
                </Alert>
            )}
        </Box>
    );
};

export default VideoUpload;
