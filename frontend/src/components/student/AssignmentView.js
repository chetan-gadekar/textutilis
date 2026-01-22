import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import assignmentService from '../../services/assignmentService';
import courseService from '../../services/courseService';
import MainLayout from '../layout/MainLayout';

const AssignmentView = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesResponse, submissionsResponse] = await Promise.all([
        courseService.getStudentCourses(),
        assignmentService.getMySubmissions(),
      ]);

      const coursesData = coursesResponse.data || [];
      const extractedCourses = coursesData.map((enrollment) => enrollment.courseId);

      // Fetch assignments for all courses
      const assignmentPromises = extractedCourses.map((course) =>
        assignmentService.getStudentAssignments(course._id).catch(() => ({ data: [] }))
      );
      const assignmentResponses = await Promise.all(assignmentPromises);

      const allAssignments = [];
      assignmentResponses.forEach((response, index) => {
        const courseAssignments = (response.data || []).map((assignment) => ({
          ...assignment,
          course: extractedCourses[index],
        }));
        allAssignments.push(...courseAssignments);
      });

      setCourses(extractedCourses);
      setAssignments(allAssignments);

      // Map submissions by assignment ID
      const submissionsMap = {};
      (submissionsResponse.data || []).forEach((submission) => {
        submissionsMap[submission.assignmentId?._id] = submission;
      });
      setSubmissions(submissionsMap);

      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (assignment) => {
    setSelectedAssignment(assignment);
    const existingSubmission = submissions[assignment._id];
    if (existingSubmission) {
      setFileUrl(existingSubmission.fileUrl);
      setFileName(existingSubmission.fileName);
    } else {
      setFileUrl('');
      setFileName('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAssignment(null);
    setFileUrl('');
    setFileName('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload the file to a storage service first
      // For now, we'll use a placeholder URL
      setFileName(file.name);
      setFileUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!fileUrl || !fileName) {
      setError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      // In production, upload file first, then submit the URL
      // For now, we'll submit with the placeholder URL
      await assignmentService.submitAssignment(selectedAssignment._id, fileUrl, fileName);
      handleCloseDialog();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit assignment');
    } finally {
      setUploading(false);
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
          My Assignments
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {assignments.length === 0 ? (
          <Alert severity="info">No assignments available.</Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {assignments.map((assignment) => {
              const submission = submissions[assignment._id];
              return (
                <Card key={assignment._id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6">{assignment.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Course: {assignment.course?.title || 'Unknown'}
                        </Typography>
                      </Box>
                      {submission && (
                        <Chip
                          label={submission.status === 'reviewed' ? 'Reviewed' : 'Submitted'}
                          color={submission.status === 'reviewed' ? 'success' : 'warning'}
                          size="small"
                        />
                      )}
                    </Box>
                    <Typography variant="body2" paragraph>
                      {assignment.description || 'No description available'}
                    </Typography>


                    {assignment.dueDate && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Due Date: {new Date(assignment.dueDate).toLocaleDateString()}
                      </Typography>
                    )}

                    {assignment.attachment && assignment.attachment.fileUrl && (
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          href={assignment.attachment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<DownloadIcon />}
                        >
                          Download Assignment Material: {assignment.attachment.fileName || 'Attachment'}
                        </Button>
                      </Box>
                    )}

                    {submission && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Submitted: {new Date(submission.submittedAt).toLocaleString()}
                        </Typography>
                        {submission.fileName && (
                          <Typography variant="body2" color="text.secondary">
                            File: {submission.fileName}
                          </Typography>
                        )}
                      </Box>
                    )}
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<UploadIcon />}
                        onClick={() => handleOpenDialog(assignment)}
                      >
                        {submission ? 'Update Submission' : 'Submit Assignment'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedAssignment?.title || 'Submit Assignment'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                style={{ marginBottom: '16px' }}
              />
              {fileName && (
                <TextField
                  label="File Name"
                  value={fileName}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              )}
              {uploading && <LinearProgress />}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!fileUrl || uploading}
            >
              {uploading ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default AssignmentView;
