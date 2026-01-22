import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import videoService from '../../../services/videoService';

const ContentDialog = ({
  open,
  onClose,
  content,
  topic,
  formData,
  onFormChange,
  onSave,
  uploadingVideo,
  setUploadingVideo,
  onError,
}) => {
  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingVideo(true);
      const response = await videoService.uploadVideo(file, formData.title || file.name);
      onFormChange({ ...formData, contentData: response.video.uid });
      setUploadingVideo(false);
    } catch (err) {
      onError(err.message || 'Failed to upload video');
      setUploadingVideo(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {content?._id ? 'Edit Content' : 'Create Content'} - {topic?.title}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Content Type</InputLabel>
            <Select
              value={formData.contentType}
              onChange={(e) => onFormChange({ ...formData, contentType: e.target.value })}
              label="Content Type"
            >
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="ppt">PPT/Presentation</MenuItem>
              <MenuItem value="text">Text</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Content Title"
            fullWidth
            value={formData.title}
            onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
            required
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
          />

          {formData.contentType === 'video' && (
            <Box>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                style={{ marginBottom: '16px' }}
              />
              {uploadingVideo && <CircularProgress size={24} />}
              {formData.contentData && !uploadingVideo && (
                <Alert severity="success">Video uploaded: {formData.contentData}</Alert>
              )}
            </Box>
          )}

          {formData.contentType === 'ppt' && (
            <TextField
              label="PPT File URL"
              fullWidth
              value={formData.contentData}
              onChange={(e) => onFormChange({ ...formData, contentData: e.target.value })}
              placeholder="Enter PPT file URL or Cloudflare Stream UID"
              required
            />
          )}

          {formData.contentType === 'text' && (
            <TextField
              label="Text Content"
              fullWidth
              multiline
              rows={6}
              value={formData.contentData}
              onChange={(e) => onFormChange({ ...formData, contentData: e.target.value })}
              required
            />
          )}

          {formData.contentType === 'video' && (
            <TextField
              label="Duration (seconds)"
              type="number"
              fullWidth
              value={formData.duration}
              onChange={(e) => onFormChange({ ...formData, duration: parseInt(e.target.value) || 0 })}
            />
          )}

          <TextField
            label="Order"
            type="number"
            fullWidth
            value={formData.order}
            onChange={(e) => onFormChange({ ...formData, order: parseInt(e.target.value) || 0 })}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained" disabled={uploadingVideo}>
          {content?._id ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContentDialog;
