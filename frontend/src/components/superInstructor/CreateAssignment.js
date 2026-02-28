import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Alert,
  CircularProgress,
  Button,
  TextField,
  Stack,
  IconButton,
  Tooltip,
  Collapse,
  Paper,
  TablePagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
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
  const [attachment, setAttachment] = useState(null);
  const [editAssignment, setEditAssignment] = useState(null);

  // Search and Pagination State
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchCourses();
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

  const fetchAllAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        title: debouncedSearch,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const response = await assignmentService.getAllAssignments(params);
      const assignmentsWithCourse = (response.data || []).map((a) => ({
        ...a,
        courseName: a.courseId?.title || 'Unknown Course',
        courseId: a.courseId?._id || a.courseId,
        visibility: 'Visible',
      }));

      setAssignments(assignmentsWithCourse);
      setTotalRecords(response.total || 0);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      setError('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, startDate, endDate]);

  useEffect(() => {
    fetchAllAssignments();
  }, [fetchAllAssignments]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleEditClick = (assignment) => {
    setEditAssignment(assignment);
    setTitle(assignment.title);
    setDescription(assignment.description);
    setSelectedCourse(assignment.courseId?._id || assignment.courseId);

    // Format date for datetime-local input
    if (assignment.dueDate) {
      const date = new Date(assignment.dueDate);
      const formattedDate = date.toISOString().slice(0, 16);
      setDueDate(formattedDate);
    }

    setAttachment(assignment.attachment);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditAssignment(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setSelectedCourse('');
    setAttachment(null);
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

      const assignmentData = {
        title,
        description,
        dueDate,
        attachment,
        courseId: selectedCourse,
      };

      if (editAssignment) {
        await assignmentService.updateAssignment(editAssignment._id, assignmentData);
        setSuccess('Assignment updated successfully!');
      } else {
        await assignmentService.createAssignment(selectedCourse, assignmentData);
        setSuccess('Assignment created successfully!');
      }

      handleCloseDialog();
      fetchAllAssignments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || `Failed to ${editAssignment ? 'update' : 'create'} assignment`);
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

  if (loading && assignments.length === 0) {
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
              Assignment Management
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title={showFilters ? "Hide Filters" : "Show Filters"}>
                <IconButton
                  onClick={() => setShowFilters(!showFilters)}
                  color={showFilters ? "primary" : "default"}
                  sx={{ bgcolor: showFilters ? 'action.hover' : 'transparent' }}
                >
                  {showFilters ? <FilterListOffIcon /> : <FilterListIcon />}
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                sx={{ bgcolor: '#1976d2' }}
              >
                CREATE ASSIGNMENT
              </Button>
            </Stack>
          </Stack>

          <Collapse in={showFilters}>
            <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: '#fbfbfb' }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                <TextField
                  label="Search by Title"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  sx={{ flexGrow: 1, minWidth: 200 }}
                  placeholder="Type to search..."
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
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
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

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <AssignmentTable
          assignments={assignments}
          onDelete={handleDeleteAssignment}
          onEdit={handleEditClick}
        />

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalRecords}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

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
          attachment={attachment}
          onAttachmentChange={(url, name) => setAttachment({ fileUrl: url, fileName: name })}
          onSubmit={handleSubmit}
          submitting={submitting}
          editing={!!editAssignment}
        />
      </Box>
    </MainLayout>
  );
};

export default CreateAssignment;
