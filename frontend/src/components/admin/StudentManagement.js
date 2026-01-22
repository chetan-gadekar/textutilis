import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import adminService from '../../services/adminService';
import MainLayout from '../layout/MainLayout';
import AssignCoursesDialog from './student/AssignCoursesDialog';
import StudentTable from './student/StudentTable';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filter, setFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assignedCourses, setAssignedCourses] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === 'active') params.isActive = true;
      if (filter === 'inactive') params.isActive = false;

      const response = await adminService.getAllStudents(params);
      setStudents(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await adminService.getAllCourses();
      setCourses(response.data || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError('Failed to load courses. Please try again.');
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, [fetchStudents, fetchCourses]);

  const handleToggleStatus = async (studentId) => {
    try {
      await adminService.toggleStudentStatus(studentId);
      fetchStudents();
      setSuccess('Student status updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to toggle student status');
    }
  };

  const handleOpenAssignDialog = async (student) => {
    setSelectedStudent(student);
    setOpenDialog(true);

    try {
      const response = await adminService.getStudentEnrollments(student._id);
      const enrolledCourseIds = response.data.map((e) => e.courseId._id);
      setAssignedCourses(new Set(enrolledCourseIds));
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
      setAssignedCourses(new Set());
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setAssignedCourses(new Set());
  };

  const handleToggleCourse = (courseId) => {
    const newAssigned = new Set(assignedCourses);
    if (newAssigned.has(courseId)) {
      newAssigned.delete(courseId);
    } else {
      newAssigned.add(courseId);
    }
    setAssignedCourses(newAssigned);
  };

  const handleSaveAssignments = async () => {
    if (!selectedStudent) return;

    try {
      setSubmitting(true);
      const courseIds = Array.from(assignedCourses);
      await adminService.assignCoursesToStudent(selectedStudent._id, courseIds);

      setSuccess('Courses assigned successfully!');
      handleCloseDialog();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to assign courses');
    } finally {
      setSubmitting(false);
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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Student Management
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant={filter === 'all' ? 'contained' : 'outlined'} onClick={() => setFilter('all')}>
              All Students
            </Button>
            <Button
              variant={filter === 'active' ? 'contained' : 'outlined'}
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={filter === 'inactive' ? 'contained' : 'outlined'}
              onClick={() => setFilter('inactive')}
            >
              Inactive
            </Button>
          </Box>
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

        <StudentTable
          students={students}
          onAssignCourses={handleOpenAssignDialog}
          onToggleStatus={handleToggleStatus}
        />

        <AssignCoursesDialog
          open={openDialog}
          onClose={handleCloseDialog}
          student={selectedStudent}
          courses={courses}
          assignedCourses={assignedCourses}
          onToggleCourse={handleToggleCourse}
          onSubmit={handleSaveAssignments}
          submitting={submitting}
        />
      </Box>
    </MainLayout>
  );
};

export default StudentManagement;
