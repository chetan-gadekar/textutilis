import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Stack,
  TablePagination,
  IconButton,
  Tooltip,
  Collapse,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
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

  // Search and Pagination State
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        name: debouncedSearch,
      };

      if (filter === 'active') params.isActive = true;
      if (filter === 'inactive') params.isActive = false;

      const response = await adminService.getAllStudents(params);
      setStudents(response.data || []);
      setTotalRecords(response.total || 0);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [filter, page, rowsPerPage, debouncedSearch]);

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
  }, [fetchStudents]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilter('all');
    setPage(0);
  };

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

  if (loading && students.length === 0) {
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
              Student Management
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
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                <TextField
                  label="Search by Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  sx={{ flexGrow: 1, minWidth: 200 }}
                  placeholder="Type to search..."
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filter}
                    label="Status"
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Students</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={handleClearFilters}
                >
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

        <StudentTable
          students={students}
          onAssignCourses={handleOpenAssignDialog}
          onToggleStatus={handleToggleStatus}
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
