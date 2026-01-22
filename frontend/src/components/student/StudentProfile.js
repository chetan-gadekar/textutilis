import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Grid,
  LinearProgress,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import studentService from '../../services/studentService';
import MainLayout from '../layout/MainLayout';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await studentService.getProfile();
      setProfile(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
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

  if (!profile) {
    return (
      <MainLayout>
        <Alert severity="error">Failed to load profile</Alert>
      </MainLayout>
    );
  }

  const { student, performance } = profile;
  const totalRating = performance?.totalRating || 0;
  const assignmentRating = performance?.assignmentRating || 0;
  const caseStudyRating = performance?.caseStudyRating || 0;

  return (
    <MainLayout>
      <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{student?.name || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{student?.email || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Role
                </Typography>
                <Typography variant="body1">
                  {student?.role?.replace('_', ' ').toUpperCase() || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Account Status
                </Typography>
                <Typography variant="body1">
                  {student?.isActive ? 'Active' : 'Inactive'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance Report
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Based on assignments and case studies (out of 5)
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Overall Rating</Typography>
                <Typography variant="h6" color="primary">
                  {totalRating}/5.0
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(totalRating / 5) * 100}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Assignment Rating</Typography>
                <Typography variant="body2" color="text.secondary">
                  {assignmentRating}/5.0
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(assignmentRating / 5) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                Assignments submitted: {performance?.assignmentCount || 0}
              </Typography>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Case Study Rating</Typography>
                <Typography variant="body2" color="text.secondary">
                  {caseStudyRating}/5.0
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(caseStudyRating / 5) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                Case studies completed: {performance?.caseStudyCount || 0}
              </Typography>
            </Box>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Note: Performance ratings can be modified by instructors. You have view-only access.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      </Box>
    </MainLayout>
  );
};

export default StudentProfile;
