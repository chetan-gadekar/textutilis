import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
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
          height: '83vh',          // 👈 Full viewport height
          overflow: 'hidden',       // 👈 Prevent scroll
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
          alignItems: 'flex-start',
          mb: 2,
          borderBottom: '1px solid #e0e0e0',
          pb: 2
        }}
      >
        <Box sx={{ flex: 1, pr: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#37474F', mb: 1.5, lineHeight: 1.4, fontFamily: 'Poppins' }}>
            Lecture : {content.title}
          </Typography>
          <FormControlLabel
            control={
              <Checkbox 
                checked={currentProgress?.isCompleted || false} 
                disabled 
                size="small"
                icon={<RadioButtonUncheckedIcon sx={{ fontSize: 20 }} />}
                checkedIcon={<CheckCircleIcon sx={{ fontSize: 20, color: '#9E9E9E' }} />}
                sx={{ p: 0.5, py: 0 }}
              />
            }
            label={<Typography variant="caption" sx={{ color: '#78909C', fontWeight: 500 }}>Mark As Complete</Typography>}
            sx={{ ml: -0.5, m: 0 }}
          />
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
