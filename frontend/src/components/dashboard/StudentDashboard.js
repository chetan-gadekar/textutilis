import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  LinearProgress,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import courseService from '../../services/courseService';
import MainLayout from '../layout/MainLayout';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getStudentCourses();
      const coursesData = response.data || [];
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

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const filteredCourses = filter === 'all'
    ? courses
    : courses.filter(course => course.enrollment?.progress > 0 && course.enrollment?.progress < 100);

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
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            My Courses
          </Typography>
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            aria-label="course filter"
            size="small"
          >
            <ToggleButton value="all" aria-label="all courses">
              All
            </ToggleButton>
            <ToggleButton value="in_progress" aria-label="in progress">
              In Progress
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {filteredCourses.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'white', borderRadius: 2 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {filter === 'all' ? 'You are not enrolled in any courses yet.' : 'No courses in progress.'}
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredCourses.map((course) => {
                  const progress = course.enrollment?.progress || 0;
                  const isStarted = progress > 0;

                  return (
                    <Grid item xs={12} key={course._id}>
                      <Card
                        sx={{
                          display: 'flex',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          borderRadius: 2,
                          overflow: 'hidden',
                          height: 180
                        }}
                      >
                        <Box sx={{ position: 'relative', width: 220, bgcolor: '#f5f5f5', flexShrink: 0 }}>
                          <CardMedia
                            component="div"
                            sx={{
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: '#f5f5f5',
                              backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              position: 'relative',
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                              }}
                            >
                              <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                SKILLS
                              </Typography>
                            </Box>
                            <Typography
                              variant="body1"
                              sx={{
                                color: 'white',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                px: 2,
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                              }}
                            >
                              {course.title}
                            </Typography>
                          </CardMedia>
                        </Box>

                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', py: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                              {course.title}
                            </Typography>
                            <Box sx={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
                              <svg width={40} height={40}>
                                <circle cx={20} cy={20} r={18} fill="none" stroke="#e0e0e0" strokeWidth={3} />
                                <circle
                                  cx={20} cy={20} r={18} fill="none"
                                  stroke={progress > 0 ? '#4caf50' : '#e0e0e0'}
                                  strokeWidth={3}
                                  strokeDasharray={`${2 * Math.PI * 18}`}
                                  strokeDashoffset={`${2 * Math.PI * 18 * (1 - progress / 100)}`}
                                  strokeLinecap="round"
                                  transform="rotate(-90 20 20)"
                                />
                              </svg>
                            </Box>
                          </Box>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {course.description || 'No description available'}
                          </Typography>

                          {isStarted && (
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">Progress</Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">{progress}%</Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                  height: 4,
                                  borderRadius: 2,
                                  bgcolor: '#e0e0e0',
                                  '& .MuiLinearProgress-bar': { bgcolor: '#4caf50' },
                                }}
                              />
                            </Box>
                          )}

                          <Box sx={{ mt: 'auto' }}>
                            <Button
                              size="small"
                              variant={isStarted ? 'contained' : 'outlined'}
                              color={isStarted ? 'error' : 'primary'}
                              endIcon={isStarted && <PlayArrowIcon />}
                              onClick={() => navigate(`/student/courses/${course._id}`)}
                              sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 'bold' }}
                            >
                              {isStarted ? 'Continue Learning' : 'Start Learning'}
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 84 }}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Skills Report
                </Typography>
                <Box
                  sx={{
                    p: 3,
                    bgcolor: '#f5f5f5',
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    filter: 'blur(1px)',
                  }}
                >
                  <Typography variant="h4" sx={{ mb: 1, opacity: 0.5 }}>
                    ⏱️
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, opacity: 0.5 }}>
                    COMING SOON
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
                    Something Cool is being prepared
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
};

export default StudentDashboard;
