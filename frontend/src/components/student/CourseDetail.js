import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Paper,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import courseService from '../../services/courseService';
import studentService from '../../services/studentService';
import VideoPlayer from '../VideoPlayer';
import MainLayout from '../layout/MainLayout';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      const [contentResponse, progressResponse] = await Promise.all([
        courseService.getStudentCourseContent(courseId),
        courseService.getStudentCourseProgress(courseId),
      ]);
      setContent(contentResponse.data || []);
      const progressMap = {};
      (progressResponse.data?.contentProgress || []).forEach((p) => {
        progressMap[p.contentId] = p;
      });
      setProgress(progressMap);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch course data');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const handleContentClick = async (contentItem) => {
    setSelectedContent(contentItem);
    if (contentItem.contentType === 'video') {
      // Fetch progress for video
      try {
        const progressResponse = await studentService.getVideoProgress(contentItem._id);
        if (progressResponse.data?.videoPosition) {
          // Progress will be handled by VideoPlayer component
        }
      } catch (err) {
        console.error('Failed to fetch video progress:', err);
      }
    }
  };

  const handleProgressUpdate = async (contentId, videoPosition, isCompleted) => {
    try {
      await studentService.saveVideoProgress({
        contentId,
        courseId,
        videoPosition,
        isCompleted,
      });
      // Refresh progress
      fetchCourseData();
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };

  const getContentIcon = (contentType) => {
    switch (contentType) {
      case 'video':
        return <PlayArrowIcon />;
      case 'ppt':
        return <PictureAsPdfIcon />;
      case 'text':
        return <DescriptionIcon />;
      default:
        return <DescriptionIcon />;
    }
  };

  const getContentProgress = (contentId) => {
    return progress[contentId] || { videoPosition: 0, isCompleted: false };
  };

  const calculateOverallProgress = () => {
    if (content.length === 0) return 0;
    const completedCount = content.filter((item) => {
      const prog = getContentProgress(item._id);
      return prog.isCompleted;
    }).length;
    return Math.round((completedCount / content.length) * 100);
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (selectedContent && selectedContent.contentType === 'video') {
    return (
      <MainLayout>
        <Box>
          <Button onClick={() => setSelectedContent(null)} sx={{ mb: 2 }}>
            ← Back to Course Content
          </Button>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              {selectedContent.title}
            </Typography>
            <VideoPlayer
              videoId={selectedContent.contentData}
              onProgress={(position) => {
                const isCompleted = position > 0.95; // Consider 95% as completed
                handleProgressUpdate(
                  selectedContent._id,
                  position * 100,
                  isCompleted
                );
              }}
            />
          </Paper>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box>
        <Button onClick={() => navigate('/student/courses')} sx={{ mb: 2 }}>
          ← Back to My Courses
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Course Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {calculateOverallProgress()}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={calculateOverallProgress()}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Paper>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Course Content</Typography>
          </Box>
          <List>
            {content.length === 0 ? (
              <ListItem>
                <ListItemText primary="No content available" />
              </ListItem>
            ) : (
              content.map((item, index) => {
                const prog = getContentProgress(item._id);
                return (
                  <ListItem
                    key={item._id}
                    button
                    onClick={() => handleContentClick(item)}
                    sx={{
                      borderBottom: index < content.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ mr: 2 }}>{getContentIcon(item.contentType)}</Box>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {item.title}
                          {prog.isCompleted && (
                            <Chip label="Completed" color="success" size="small" />
                          )}
                        </Box>
                      }
                      secondary={
                        item.contentType === 'video'
                          ? `Video • ${item.duration || 0}s`
                          : item.contentType === 'ppt'
                            ? 'Presentation'
                            : 'Text Content'
                      }
                    />
                    {item.contentType === 'video' && prog.videoPosition > 0 && (
                      <Chip
                        label={`${Math.round(prog.videoPosition)}% watched`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </ListItem>
                );
              })
            )}
          </List>
        </Paper>
      </Box>
    </MainLayout>
  );
};

export default CourseDetail;
