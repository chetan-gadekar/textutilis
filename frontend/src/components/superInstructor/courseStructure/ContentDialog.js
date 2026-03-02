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
  Typography,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import videoService from '../../../services/videoService';
import FileUpload from '../../common/FileUpload';
import VideoUpload from '../../common/VideoUpload';

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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            bgcolor: 'action.hover',
            p: 1.5,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DescriptionIcon color="primary" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {content?._id ? 'Edit Content' : 'Create Content'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {topic?.title ? `Adding to ${topic.title}` : 'Add content to this topic'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ mt: 1 }}>
        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
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
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Cloudinary Video Upload (Testing)
              </Typography>
              <VideoUpload
                label="Upload Video to Cloudinary"
                onUploadSuccess={(url, fileName, duration) => {
                  onFormChange({
                    ...formData,
                    contentData: url,
                    duration: Math.round(duration) || formData.duration
                  });
                }}
              />

              {/* Old Cloudflare Upload - Commented out for now */}
              {/* 
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                style={{ marginBottom: '16px' }}
              />
              {uploadingVideo && <CircularProgress size={24} />}
              */}

              {formData.contentData && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Content Data: {formData.contentData.substring(0, 50)}...
                </Alert>
              )}
            </Box>
          )}

          {formData.contentType === 'ppt' && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                PPT/Presentation File
              </Typography>
              <FileUpload
                label="Upload PPT Material"
                accept=".ppt,.pptx,.pdf"
                onUploadSuccess={(url) => onFormChange({ ...formData, contentData: url })}
              />
              {formData.contentData && (
                <TextField
                  label="PPT File URL"
                  fullWidth
                  value={formData.contentData}
                  onChange={(e) => onFormChange({ ...formData, contentData: e.target.value })}
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
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
      <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'flex-end', gap: 1 }}>
        <Button
          onClick={onClose}
          startIcon={<CloseIcon />}
          sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 500, px: 2 }}
        >
          CANCEL
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          color="primary"
          disabled={uploadingVideo}
          startIcon={uploadingVideo ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            borderRadius: 2,
            boxShadow: 2,
            '&:hover': { boxShadow: 4 },
          }}
        >
          {content?._id ? 'Update Content' : 'Create Content'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContentDialog;
