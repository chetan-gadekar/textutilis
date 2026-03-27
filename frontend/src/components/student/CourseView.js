import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Container,
  Tab,
  Tabs,
  InputBase,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import courseService from '../../services/courseService';
import MainLayout from '../layout/MainLayout';
import CourseCard from './CourseCard';

const CourseView = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0); // 0: All, 1: In Progress, 2: Completed

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

  const handleStartContinue = (courseId) => {
    navigate(`/student/courses/${courseId}`);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredCourses = courses.filter(course => {
    if (tabValue === 0) return true;
    if (tabValue === 1) return (course.enrollment?.progress > 0 && course.enrollment?.progress < 100);
    if (tabValue === 2) return course.enrollment?.progress === 100;
    return true;
  });

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
          <Box>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              My Courses
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Paper
              elevation={0}
              sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 250, border: '1px solid #e0e0e0', borderRadius: '10px' }}
            >
              <Tooltip title="Search">
                <IconButton sx={{ p: '10px' }} aria-label="search">
                  <SearchIcon />
                </IconButton>
              </Tooltip>
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search courses..."
              />
            </Paper>

            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="course status tabs"
              sx={{
                '& .MuiTabs-indicator': { borderRadius: '2px' },
                display: { xs: 'none', md: 'flex' }
              }}
            >
              <Tab label="All" />
              <Tab label="In Progress" />
              <Tab label="Completed" />
            </Tabs>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {filteredCourses.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              bgcolor: 'white',
              borderRadius: '16px',
              border: '1px dashed #e0e0e0'
            }}
          >
            <Box
              component="img"
              src="https://cdn-icons-png.flaticon.com/512/7486/7486747.png"
              sx={{
                width: 120,
                height: 120,
                opacity: 0.5,
                mb: 2,
                display: 'block',
                mx: 'auto'   // 👈 This centers it perfectly
              }}
            />

            <Typography variant="h6" color="text.secondary">
              No courses found in this category.
            </Typography>

            <Typography variant="body2" color="text.disabled">
              Try checking other tabs or browse new courses.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {/* Left Column: Course Cards */}
            <Grid item xs={12} lg={8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {filteredCourses.map((course) => (
                  <Box key={course._id}>
                    <CourseCard
                      course={course}
                      onStart={handleStartContinue}
                      onContinue={handleStartContinue}
                    />
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Right Column: Upcoming Events Placeholder */}
            <Grid item xs={12} lg={4} sx={{ display: { xs: 'none', lg: 'block' } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
                Upcoming Events
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: '#eaeaea',
                  bgcolor: '#ffffff',
                  textAlign: 'center'
                }}
              >
                <Box
                  component="img"
                  src="https://cdn-icons-png.flaticon.com/512/7486/7486747.png"
                  alt="Upcoming Events Placeholder"
                  sx={{ width: 140, height: 140, mb: 3, mx: 'auto', display: 'block', opacity: 0.8 }}
                />
                <Typography variant="body2" sx={{ color: '#555', mb: 2, px: 2, lineHeight: 1.5 }}>
                  Enroll in a course or masterclass to view upcoming classes
                </Typography>
                <Typography variant="caption" sx={{ color: '#777' }}>
                  Need More Info? <span style={{ color: '#ea6554', cursor: 'pointer', fontWeight: 500 }}>Connect To Counsellor</span>
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
    </MainLayout>
  );
};

export default CourseView;
