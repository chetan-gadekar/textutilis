import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Paper,
  Box,
  Alert,
  CircularProgress,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Autocomplete,
  Stack,
  IconButton,
  Tooltip,
  Collapse,
  TablePagination,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import assignmentService from '../../services/assignmentService';
import MainLayout from '../layout/MainLayout';

const AssignmentReview = () => {
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [debouncedTitle, setDebouncedTitle] = useState('');

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Debounce assignment title
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitle(assignmentTitle);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [assignmentTitle]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await assignmentService.getStudents({ limit: 1000 });
      setStudents(response.data || []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        studentId: selectedStudent?._id,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        assignmentTitle: debouncedTitle || undefined,
      };

      const response = await assignmentService.getAllSubmissions(params);
      setSubmissions(response.data || []);
      setTotalRecords(response.total || 0);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, selectedStudent, startDate, endDate, debouncedTitle]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setSelectedStudent(null);
    setStartDate('');
    setEndDate('');
    setAssignmentTitle('');
    setPage(0);
  };

  if (loading && submissions.length === 0 && !showFilters) {
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
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" gutterBottom>
              Review Assignments
            </Typography>
            <Tooltip title={showFilters ? "Hide Filters" : "Show Filters"}>
              <IconButton
                onClick={() => setShowFilters(!showFilters)}
                color={showFilters ? "primary" : "default"}
                sx={{ bgcolor: showFilters ? 'action.hover' : 'transparent' }}
              >
                {showFilters ? <FilterListOffIcon /> : <FilterListIcon />}
              </IconButton>
            </Tooltip>
          </Stack>

          <Collapse in={showFilters}>
            <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: '#fbfbfb' }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <Autocomplete
                  options={students}
                  getOptionLabel={(option) => `${option.name} (${option.email})`}
                  value={selectedStudent}
                  onChange={(event, newValue) => {
                    setSelectedStudent(newValue);
                    setPage(0);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Search Student" size="small" />
                  )}
                  sx={{ flexGrow: 1, minWidth: 250 }}
                />
                <TextField
                  label="Assignment Title"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  size="small"
                  sx={{ minWidth: 200 }}
                  placeholder="Search by title..."
                />
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 150 }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 150 }}
                />
              </Stack>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="outlined" size="small" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </Box>
            </Paper>
          </Collapse>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper} sx={{ borderRadius: 1, boxShadow: 1 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Course</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Assignment</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>File</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Submitted At</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No submissions found
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((submission) => (
                  <TableRow key={submission._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {submission.studentId?.name || 'Unknown Student'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {submission.studentId?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{submission.assignmentId?.courseId?.title || 'Unknown Course'}</TableCell>
                    <TableCell>{submission.assignmentId?.title || 'N/A'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {submission.fileName}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={submission.status}
                        color={submission.status === 'reviewed' ? 'success' : 'warning'}
                        size="small"
                        variant="outlined"
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
                          sx={{ textTransform: 'none' }}
                        >
                          View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalRecords}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>
    </MainLayout>
  );
};

export default AssignmentReview;
