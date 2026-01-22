import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from '@mui/material';
import assignmentService from '../../services/assignmentService';
import courseService from '../../services/courseService';
import MainLayout from '../layout/MainLayout';

const AssignmentReview = () => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchAssignments(selectedCourse);
    } else {
      setAssignments([]);
      setSubmissions([]);
      setSelectedAssignment('');
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedAssignment) {
      fetchSubmissions(selectedAssignment);
    } else {
      setSubmissions([]);
    }
  }, [selectedAssignment]);

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

  const fetchAssignments = async (courseId) => {
    try {
      const response = await assignmentService.getAssignments(courseId);
      setAssignments(response.data || []);
      setSelectedAssignment('');
    } catch (err) {
      setError(err.message || 'Failed to fetch assignments');
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const response = await assignmentService.getSubmissions(assignmentId);
      setSubmissions(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch submissions');
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
        <Typography variant="h4" component="h1" gutterBottom>
          Review Assignments
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Select Course</InputLabel>
            <Select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              label="Select Course"
            >
              {courses.map((course) => (
                <MenuItem key={course._id} value={course._id}>
                  {course.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={!selectedCourse || assignments.length === 0}>
            <InputLabel>Select Assignment</InputLabel>
            <Select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              label="Select Assignment"
            >
              {assignments.map((assignment) => (
                <MenuItem key={assignment._id} value={assignment._id}>
                  {assignment.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {selectedAssignment && submissions.length === 0 && (
          <Alert severity="info">No submissions found for this assignment</Alert>
        )}

        {submissions.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Submissions ({submissions.length})
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>File</TableCell>
                    <TableCell>Submitted At</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission._id}>
                      <TableCell>{submission.studentId?.name || 'Unknown Student'}</TableCell>
                      <TableCell>{submission.studentId?.email || 'N/A'}</TableCell>
                      <TableCell>{submission.fileName}</TableCell>
                      <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={submission.status}
                          color={submission.status === 'reviewed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {submission.fileUrl && (
                          <Button
                            variant="contained"
                            size="small"
                            href={submission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default AssignmentReview;
