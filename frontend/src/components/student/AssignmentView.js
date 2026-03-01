import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Stack,
  MenuItem,
  Collapse,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import assignmentService from '../../services/assignmentService';
import MainLayout from '../layout/MainLayout';
import FileUpload from '../common/FileUpload';

const AssignmentView = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('all');

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: status !== 'all' ? status : undefined,
      };

      const response = await assignmentService.getMyAssignments(params);
      setAssignments(response.assignments || []);
      setTotalRecords(response.total || 0);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, startDate, endDate, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatus('all');
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (assignment) => {
    setSelectedAssignment(assignment);
    const existingSubmission = assignment.submission;
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



  const handleSubmit = async () => {
    if (!fileUrl || !fileName) {
      setError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      await assignmentService.submitAssignment(selectedAssignment._id, fileUrl, fileName);
      handleCloseDialog();
      fetchData(); // Refresh list to update status
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit assignment');
    } finally {
      setUploading(false);
    }
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            My Assignments
          </Typography>
          <Button
            startIcon={showFilters ? <FilterListOffIcon /> : <FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            variant="outlined"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </Box>

        <Collapse in={showFilters}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <TextField
                label="Start Date (Due)"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(0);
                }}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="End Date (Due)"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(0);
                }}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                select
                label="Status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(0);
                }}
                fullWidth
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </TextField>
            </Stack>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={handleClearFilters} color="primary">
                Clear Filters
              </Button>
            </Box>
          </Paper>
        </Collapse>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : assignments.length === 0 ? (
          <Alert severity="info">No assignments found matching your criteria.</Alert>
        ) : (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Assignment</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assignment File</TableCell>
                    <TableCell>My Submission</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment._id}>
                      <TableCell>
                        <Typography variant="body1" fontWeight="bold">
                          {assignment.title}
                        </Typography>
                        {assignment.description && (
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                            {assignment.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {assignment.course?.title || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No Due Date'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={assignment.status === 'submitted' ? 'Submitted' : 'Pending'}
                          color={assignment.status === 'submitted' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {assignment.attachments && assignment.attachments.length > 0 ? (
                          <Stack spacing={1}>
                            {assignment.attachments.map((file, index) => (
                              <Button
                                key={index}
                                variant="outlined"
                                size="small"
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<DownloadIcon />}
                                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                              >
                                {file.fileName || `File ${index + 1}`}
                              </Button>
                            ))}
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">None</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {assignment.submission ? (
                          <Box>
                            <Typography variant="caption" display="block">
                              {new Date(assignment.submission.submittedAt).toLocaleDateString()}
                            </Typography>
                            {assignment.submission.fileName && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                {assignment.submission.fileName}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<UploadIcon />}
                          onClick={() => handleOpenDialog(assignment)}
                        >
                          {assignment.submission ? 'Update' : 'Submit'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalRecords}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedAssignment?.title || 'Submit Assignment'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <FileUpload
                label="Select Assignment File"
                accept=".pdf,.doc,.docx,.txt"
                onUploadSuccess={(url, name) => {
                  setFileUrl(url);
                  setFileName(name);
                }}
              />
              {fileName && !uploading && (
                <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                  Ready to submit: {fileName}
                </Typography>
              )}
              {uploading && <LinearProgress sx={{ mt: 2 }} />}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={uploading}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!fileUrl || uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
            >
              {uploading ? 'Submitting...' : 'Confirm Submission'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default AssignmentView;
