import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Box,
    Alert,
    CircularProgress,
    Chip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import courseService from '../../services/courseService';
import MainLayout from '../layout/MainLayout';

const InstructorCourses = () => {
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
            // Calls the /super-instructor/courses endpoint which returns Owned + Assigned courses
            const response = await courseService.getCourses();
            setCourses(response.data || []);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    const handleViewAssignments = (courseId) => {
        navigate('/instructor/assignments');
        // Note: ideally we might want to pre-select this course in the review page, 
        // but the Review page logic relies on its own dropdown state.
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
                    <Alert severity="info">You have not been assigned any courses yet.</Alert>
                ) : (
                    <Grid container spacing={3}>
                        {courses.map((course) => (
                            <Grid item xs={12} md={6} key={course._id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
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
                                        <Box sx={{ mt: 1 }}>
                                            {/* Potentially show instructor name if it's assigned? */}
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleViewAssignments(course._id)}
                                            startIcon={<VisibilityIcon />}
                                        >
                                            Review Assignments
                                        </Button>
                                        {/* Add more actions if needed */}
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

export default InstructorCourses;
