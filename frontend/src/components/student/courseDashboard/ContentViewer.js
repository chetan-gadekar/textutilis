import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import VideoPlayer from '../../VideoPlayer';
import ProtectedPDFViewer from './ProtectedPDFViewer';

const ContentViewer = ({ content, course, currentProgress, onProgressUpdate }) => {
  const containerRef = React.useRef(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for escape key or other ways fullscreen exits
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!content) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          bgcolor: 'white',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          p: 4,
          textAlign: 'center'
        }}
      >
        {course?.bannerImage && (
          <Box
            component="img"
            src={course.bannerImage}
            alt={course.title}
            sx={{
              width: '100%',
              maxWidth: 600,
              height: 300,
              borderRadius: 2,
              objectFit: 'cover',
              mb: 4,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          />
        )}
        <Box>
          <Typography variant="h4" color="text.primary" sx={{ mb: 1, fontWeight: 700 }}>
            Welcome to {course?.title || 'Your Course'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            Select a lecture from the sidebar to start your learning journey
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      onContextMenu={handleContextMenu}
      sx={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
        mozUserSelect: 'none',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          pb: 2,
          borderBottom: '2px solid #e0e0e0',
        }}
      >
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
            Current Lecture
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            {content.title}
          </Typography>
        </Box>
        {content.contentType === 'ppt' && content.contentData && (
          <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Full Screen"}>
            <IconButton
              onClick={toggleFullScreen}
              sx={{
                bgcolor: '#1976d2',
                color: 'white',
                '&:hover': { bgcolor: '#1565c0' },
              }}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Content Area */}
      <Paper
        ref={containerRef}
        elevation={2}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'white',
          height: isFullscreen ? '100vh' : 'auto',
        }}
      >
        {content.contentType === 'video' ? (
          <VideoPlayer
            videoId={content.contentData}
            onProgress={onProgressUpdate}
            initialPosition={currentProgress?.videoPosition ? currentProgress.videoPosition / 100 : 0}
          />
        ) : content.contentType === 'ppt' ? (
          <Box sx={{ p: 3 }}>
            {content.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {content.description}
              </Typography>
            )}
            {content.contentData && (
              <ProtectedPDFViewer
                fileUrl={content.contentData}
                title={content.title}
              />
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
