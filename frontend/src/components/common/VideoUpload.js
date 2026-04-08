import React, { useState, useRef } from 'react';
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
import MovieIcon from '@mui/icons-material/Movie';
import CloseIcon from '@mui/icons-material/Close';
import uploadService from '../../services/uploadService';

const VideoUpload = ({ onUploadSuccess, label = "Upload Video" }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [success, setSuccess] = useState(false);
    const [uploadStats, setUploadStats] = useState({ loadedMB: 0, totalMB: 0, speedMBps: "0.00" });
    const startTimeRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // 3GB limit for videos (R2 supports larger files)
            if (selectedFile.size > 3 * 1024 * 1024 * 1024) {
                notify.error("Video file too large (max 3GB)");
                return;
            }
            if (!selectedFile.type.startsWith('video/')) {
                notify.error("Please select a valid video file");
                return;
            }
            setFile(selectedFile);
            setSuccess(false);
            setUploadProgress(0);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setUploading(true);
            // Removed orphaned setError(null)
            setUploadProgress(0);
            setUploadStats({ loadedMB: 0, totalMB: 0, speedMBps: "0.00" });
            startTimeRef.current = Date.now();

            const response = await uploadService.uploadVideo(file, (progress, loaded, total) => {
                setUploadProgress(progress);
                
                if (loaded !== undefined && total !== undefined) {
                    const now = Date.now();
                    const elapsedTime = (now - startTimeRef.current) / 1000;
                    
                    let currentSpeedMBps = "0.00";
                    if (elapsedTime > 0) {
                        const speedBytesPerSec = loaded / elapsedTime;
                        currentSpeedMBps = (speedBytesPerSec / (1024 * 1024)).toFixed(2);
                    }
                    
                    setUploadStats({
                        loadedMB: (loaded / (1024 * 1024)).toFixed(2),
                        totalMB: (total / (1024 * 1024)).toFixed(2),
                        speedMBps: currentSpeedMBps
                    });
                }
            });

            if (response.success) {
                setSuccess(true);
                setUploadProgress(100);
                notify.success('Video uploaded successfully!');
                onUploadSuccess(response.data.url, response.data.fileName, 0);
            } else {
                notify.error(response.message || "Upload failed");
            }
        } catch (err) {
            notify.error(err.response?.data?.message || err.message || "An error occurred during video upload");
        } finally {
            setUploading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setUploading(false);
        setUploadProgress(0);
        // Removed orphaned setError(null)
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
                            
                            {/* Real-time Data Output */}
                            {uploadStats.totalMB > 0 && uploadProgress < 95 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                    <Typography variant="caption" color="textSecondary">
                                        {uploadStats.loadedMB} MB / {uploadStats.totalMB} MB
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {uploadStats.speedMBps} MB/s
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </Paper>
            )}
            {/* Legacy alerts removed in favor of premium toasts */}
        </Box>
    );
};

export default VideoUpload;
