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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VideoPlayer from '../../VideoPlayer';
import ProtectedPDFViewer from './ProtectedPDFViewer';

const ContentViewer = ({ content, course, currentProgress, onProgressUpdate, onNextContent, hasNextContent }) => {
  const containerRef = React.useRef(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.warn(`Native fullscreen request ignored/blocked: ${err.message}`);
        });
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.warn(`Error exiting native fullscreen: ${err.message}`);
        });
      }
      setIsFullscreen(false);
    }
  };

  // Listen for escape key or other ways native fullscreen exits
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        setIsFullscreen(true);
      } else if (isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen]);

  if (!content) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '83vh',
          overflow: 'hidden',
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

  // Helper: detect file type from URL and render the right viewer
  // PDF  → ProtectedPDFViewer (same as before, download/print stripped)
  // PPT  → Office Online iframe (sandboxed, no download link, context-menu blocked)
  const renderPptContent = () => {
    const urlPath = (content.contentData || '').split('?')[0].toLowerCase();
    const isPDF = urlPath.endsWith('.pdf');
    const isPPT = urlPath.endsWith('.ppt') || urlPath.endsWith('.pptx');

    const viewerHeight = isFullscreen ? '100vh' : '750px';

    return (
      <Box sx={{ p: isFullscreen ? 0 : 3, height: isFullscreen ? '100vh' : 'auto' }}>
        {!isFullscreen && content.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {content.description}
          </Typography>
        )}
        {content.contentData && isPDF ? (
          <ProtectedPDFViewer
            fileUrl={content.contentData}
            title={content.title}
            height={viewerHeight}
          />
        ) : content.contentData && isPPT ? (
          <Box
            onContextMenu={(e) => e.preventDefault()}
            sx={{
              border: isFullscreen ? 'none' : '1px solid rgba(0, 0, 0, 0.3)',
              borderRadius: isFullscreen ? '0px' : '8px',
              overflow: 'hidden',
              height: viewerHeight,
              userSelect: 'none',
              WebkitUserSelect: 'none',
              msUserSelect: 'none',
              MozUserSelect: 'none',
            }}
          >
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(content.contentData)}`}
              width="100%"
              height="100%"
              frameBorder="0"
              title={content.title || 'Presentation'}
              style={{ border: 'none' }}
              sandbox="allow-scripts allow-same-origin allow-forms"
              allowFullScreen
            />
          </Box>
        ) : content.contentData ? (
          <ProtectedPDFViewer
            fileUrl={content.contentData}
            title={content.title}
            height={viewerHeight}
          />
        ) : null}
      </Box>
    );
  };

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
                onChange={(e) => onProgressUpdate(e.target.checked ? 1 : 0, true)}
                size="small"
                icon={<RadioButtonUncheckedIcon sx={{ fontSize: 20 }} />}
                checkedIcon={<CheckCircleIcon sx={{ fontSize: 20, color: '#6A4E9E' }} />}
                sx={{ 
                  p: 0.5, 
                  py: 0,
                  '&.Mui-checked': { color: '#6A4E9E' }
                }}
              />
            }
            label={<Typography variant="caption" sx={{ color: '#616161', fontWeight: 600, fontFamily: 'Poppins' }}>Mark As Complete</Typography>}
            sx={{ ml: -0.5, m: 0 }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {hasNextContent && currentProgress?.isCompleted && (
            <Tooltip title="Next Lesson">
              <IconButton
                onClick={onNextContent}
                sx={{
                  bgcolor: '#6A4E9E',
                  color: 'white',
                  borderRadius: 2,
                  '&:hover': { bgcolor: '#5A3E8E', transform: 'translateX(3px)' },
                  transition: 'all 0.2s',
                  px: 2,
                  gap: 1
                }}
              >
                <Typography variant="button" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>Next</Typography>
                <ArrowForwardIcon />
              </IconButton>
            </Tooltip>
          )}
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
      </Box>

      {/* Content Area */}
      <Paper
        ref={containerRef}
        elevation={isFullscreen ? 0 : 2}
        sx={isFullscreen ? {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          borderRadius: 0,
          overflow: 'hidden',
          bgcolor: 'white',
        } : {
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'white',
          position: 'relative',
        }}
      >
        {isFullscreen && (
          <Tooltip title="Exit Fullscreen">
            <IconButton
              onClick={toggleFullScreen}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 10000,
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              <FullscreenExitIcon />
            </IconButton>
          </Tooltip>
        )}
        {content.contentType === 'video' ? (
          <VideoPlayer
            videoId={content.contentData}
            onProgress={(progress) => {
              onProgressUpdate(progress);
              // Auto-transition if video ends
              if (progress >= 0.99 && hasNextContent) {
                setTimeout(onNextContent, 1500);
              }
            }}
            initialPosition={currentProgress?.videoPosition ? currentProgress.videoPosition / 100 : 0}
          />
        ) : content.contentType === 'ppt' ? (
          renderPptContent()
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
