import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, Button, Grid, Card, CardContent } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import MainLayout from './MainLayout';
import StudentDashboard from '../dashboard/StudentDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isSuperInstructor, isInstructor, isStudent } = useAuth();

  // If student, show student dashboard
  if (isStudent) {
    return <StudentDashboard />;
  }

  const getRoleDashboard = () => {
    if (isAdmin) {
      return (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Student Management
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Manage student accounts, activate/deactivate students
                </Typography>
                <Button variant="contained" onClick={() => navigate('/admin/students')}>
                  Manage Students
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Faculty Management
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Create, edit, and delete faculty users
                </Typography>
                <Button variant="contained" onClick={() => navigate('/admin/faculty')}>
                  Manage Faculty
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Teaching Points
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  View teaching points from all instructors
                </Typography>
                <Button variant="contained" onClick={() => navigate('/admin/teaching-points')}>
                  View Teaching Points
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }

    if (isSuperInstructor) {
      return (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Course Management
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Create, edit, and delete courses
                </Typography>
                <Button variant="contained" onClick={() => navigate('/super-instructor/courses')}>
                  Manage Courses
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Course Content
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Manage course content (videos, PPTs, text)
                </Typography>
                <Button variant="contained" onClick={() => navigate('/super-instructor/courses')}>
                  Manage Content
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Assignments
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Create and manage assignments
                </Typography>
                <Button variant="contained" onClick={() => navigate('/super-instructor/courses')}>
                  Manage Assignments
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }

    if (isInstructor) {
      return (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Today's Teaching Points
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Update today's teaching points
                </Typography>
                <Button variant="contained" onClick={() => navigate('/instructor/teaching-points')}>
                  Update Teaching Points
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Review Assignments
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Review assignments submitted by students
                </Typography>
                <Button variant="contained" onClick={() => navigate('/instructor/assignments')}>
                  Review Assignments
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }

    if (isStudent) {
      return (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  My Courses
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  View and access your enrolled courses
                </Typography>
                <Button variant="contained" onClick={() => navigate('/student/courses')}>
                  View My Courses
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  My Assignments
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  View and submit assignments
                </Typography>
                <Button variant="contained" onClick={() => navigate('/student/assignments')}>
                  View Assignments
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  My Profile
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  View your profile and performance report
                </Typography>
                <Button variant="contained" onClick={() => navigate('/student/profile')}>
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    }

    return null;
  };

  return (
    <MainLayout>
      <Box>
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Welcome, {user?.name}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Role: {user?.role?.replace('_', ' ').toUpperCase()}
          </Typography>
        </Box>
        {getRoleDashboard()}
      </Box>
    </MainLayout>
  );
};

export default Dashboard;
