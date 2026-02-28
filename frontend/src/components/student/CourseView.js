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
  IconButton
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
              <IconButton sx={{ p: '10px' }} aria-label="search">
                <SearchIcon />
              </IconButton>
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
          <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'white', borderRadius: '16px', border: '1px dashed #e0e0e0' }}>
            <Box
              component="img"
              src="https://cdn-icons-png.flaticon.com/512/7486/7486747.png"
              sx={{ width: 120, height: 120, opacity: 0.5, mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary">
              No courses found in this category.
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Try checking other tabs or browse new courses.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredCourses.map((course) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={course._id}>
                <CourseCard
                  course={course}
                  onStart={handleStartContinue}
                  onContinue={handleStartContinue}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </MainLayout>
  );
};

export default CourseView;
