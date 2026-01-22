import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  LinearProgress,
  Box,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import courseService from '../../services/courseService';
import MainLayout from '../layout/MainLayout';

const CourseView = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getStudentCourses();
      const coursesData = response.data || [];
      // Extract course from enrollment object
      const extractedCourses = coursesData.map((enrollment) => ({
        ...enrollment.courseId,
        enrollment: {
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt,
        },
      }));
      setCourses(extractedCourses);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourse = (courseId) => {
    navigate(`/student/courses/${courseId}`);
  };

  const handleStartLearning = (courseId) => {
    navigate(`/student/courses/${courseId}`);
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

  return (
    <MainLayout>
      <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Courses
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {courses.length === 0 ? (
        <Alert severity="info">You are not enrolled in any courses yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} md={6} key={course._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Typography variant="h5" component="h2">
                      {course.title}
                    </Typography>
                    {course.isVisible && (
                      <Chip label="Active" color="success" size="small" />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {course.description || 'No description available'}
                  </Typography>
                  {course.enrollment && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {course.enrollment.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={course.enrollment.progress}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  {course.enrollment?.progress > 0 ? (
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => handleViewCourse(course._id)}
                      endIcon={<PlayArrowIcon />}
                    >
                      Continue Learning
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleStartLearning(course._id)}
                    >
                      Start Learning
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      </Box>
    </MainLayout>
  );
};

export default CourseView;
