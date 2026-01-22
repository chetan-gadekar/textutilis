import React from 'react';
import {
  Box,
  Typography,
  Paper,
} from '@mui/material';
import VideoPlayer from '../../VideoPlayer';

const ContentViewer = ({ content, currentProgress, onProgressUpdate }) => {
  if (!content) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Select a lecture from the sidebar to start learning
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Lecture: {content.title}
      </Typography>

      <Paper sx={{ p: 0, mb: 2, borderRadius: 2, overflow: 'hidden' }}>
        {content.contentType === 'video' ? (
          <VideoPlayer
            videoId={content.contentData}
            onProgress={onProgressUpdate}
            initialPosition={currentProgress?.videoPosition ? currentProgress.videoPosition / 100 : 0}
          />
        ) : content.contentType === 'ppt' ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h6" gutterBottom>
              Presentation Content
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {content.description || 'PPT content will be displayed here'}
            </Typography>
            {content.contentData && (
              <Box sx={{ mt: 2 }}>
                <iframe
                  src={content.contentData}
                  width="100%"
                  height="600px"
                  style={{ border: 'none' }}
                  title={content.title}
                />
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {content.contentData}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ContentViewer;
