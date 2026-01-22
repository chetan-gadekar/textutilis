import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import courseService from '../../services/courseService';
import assignmentService from '../../services/assignmentService';
import MainLayout from '../layout/MainLayout';
import AssignmentFormDialog from './assignment/AssignmentFormDialog';
import AssignmentTable from './assignment/AssignmentTable';

const CreateAssignment = () => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchAllAssignments();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourses();
      setCourses(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAssignments = async () => {
    try {
      const response = await courseService.getCourses();
      const allCourses = response.data || [];

      const allAssignments = [];
      for (const course of allCourses) {
        try {
          const res = await assignmentService.getAssignments(course._id);
          const assignmentsWithCourse = (res.data || []).map((a) => ({
            ...a,
            courseName: course.title,
            courseId: course._id,
            visibility: 'Visible',
          }));
          allAssignments.push(...assignmentsWithCourse);
        } catch (e) {
          console.error(`Failed to fetch assignments for course ${course._id}`);
        }
      }
      setAssignments(allAssignments);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTitle('');
    setDescription('');
    setDueDate('');
    setSelectedCourse('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCourse || !title || !description || !dueDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      let attachment = null;

      await assignmentService.createAssignment(selectedCourse, {
        title,
        description,
        dueDate,
        attachment,
      });

      setSuccess('Assignment created successfully!');
      handleCloseDialog();
      fetchAllAssignments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      await assignmentService.deleteAssignment(assignmentId);
      setSuccess('Assignment deleted successfully!');
      fetchAllAssignments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete assignment');
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

  return (
    <MainLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Assignment Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ bgcolor: '#1976d2' }}
          >
            CREATE ASSIGNMENT
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <AssignmentTable assignments={assignments} onDelete={handleDeleteAssignment} />

        <AssignmentFormDialog
          open={openDialog}
          onClose={handleCloseDialog}
          courses={courses}
          selectedCourse={selectedCourse}
          onCourseChange={(e) => setSelectedCourse(e.target.value)}
          title={title}
          onTitleChange={(e) => setTitle(e.target.value)}
          description={description}
          onDescriptionChange={(e) => setDescription(e.target.value)}
          dueDate={dueDate}
          onDueDateChange={(e) => setDueDate(e.target.value)}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </Box>
    </MainLayout>
  );
};

export default CreateAssignment;
