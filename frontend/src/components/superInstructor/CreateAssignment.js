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
import { Plus, Filter, FilterX } from 'lucide-react';
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
  const [attachments, setAttachments] = useState([]);
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

    setAttachments(assignment.attachments || []);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditAssignment(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setSelectedCourse('');
    setAttachments([]);
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
        attachments,
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

  const handleAddAttachment = (fileUrl, fileName) => {
    setAttachments(prev => [...prev, { fileUrl, fileName }]);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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
      <div className="font-poppins h-full">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-medium text-gray-800">Assignment Management</h1>
            <p className="text-gray-500 mt-1 font-light">Create, monitor, and organize assignments</p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip title={showFilters ? "Hide Filters" : "Show Filters"} placement="top">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl transition-colors ${showFilters ? 'bg-theme/10 text-theme' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'}`}
              >
                {showFilters ? <FilterX size={20} strokeWidth={2} /> : <Filter size={20} strokeWidth={2} />}
              </button>
            </Tooltip>
            <button
              onClick={handleOpenDialog}
              className="bg-theme hover:bg-theme-dark text-white font-medium py-2.5 px-5 rounded-lg transition-colors duration-200 shadow-sm hover:shadow flex items-center gap-2"
            >
              <Plus size={20} strokeWidth={2} />
              Create Assignment
            </button>
          </div>
        </div>

        <Collapse in={showFilters}>
          <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm mt-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-grow w-full">
                <label className="block text-xs font-medium text-gray-500 mb-1">Search Assignments</label>
                <input
                  type="text"
                  placeholder="Search by Title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all"
                />
              </div>
              <div className="w-full md:w-auto">
                <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full md:w-40 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all text-gray-700"
                />
              </div>
              <div className="w-full md:w-auto">
                <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full md:w-40 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all text-gray-700"
                />
              </div>
              <button
                onClick={handleClearFilters}
                className="w-full md:w-auto px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-theme/20 transition-colors shadow-sm whitespace-nowrap"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </Collapse>
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-500">
              <span className="sr-only">Close</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
            <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-500">
              <span className="sr-only">Close</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <AssignmentTable
          assignments={assignments}
          onDelete={handleDeleteAssignment}
          onEdit={handleEditClick}
          pagination={
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalRecords}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                border: 'none',
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: 0,
                },
                '.MuiTablePagination-select': {
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.875rem',
                  color: '#374151',
                  fontWeight: 500,
                },
                '.MuiTablePagination-actions .MuiIconButton-root': {
                  color: '#6b7280',
                }
              }}
            />
          }
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
          attachments={attachments}
          onAddAttachment={handleAddAttachment}
          onRemoveAttachment={handleRemoveAttachment}
          onSubmit={handleSubmit}
          submitting={submitting}
          editing={!!editAssignment}
        />
      </div>
    </MainLayout>
  );
};

export default CreateAssignment;
