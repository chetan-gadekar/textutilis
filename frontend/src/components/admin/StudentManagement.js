import React, { useState, useEffect, useCallback } from 'react';
import {
  Tooltip,
  Collapse,
  TablePagination,
} from '@mui/material';
import { Filter, FilterX } from 'lucide-react';
import adminService from '../../services/adminService';
import notify from '../../utils/notify';
import MainLayout from '../layout/MainLayout';
import AssignCoursesDialog from './student/AssignCoursesDialog';
import StudentTable from './student/StudentTable';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assignedCourses, setAssignedCourses] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  // Search and Pagination State
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filter, setFilter] = useState('all');

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
    } catch (err) {
      notify.error(err.message || 'Failed to fetch students');
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
      notify.error('Failed to load courses. Please try again.');
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

  const handleToggleStatus = async (studentId, currentStatus) => {
    // Optimistic UI update: instantly toggle the status in the UI
    setStudents(prevStudents => prevStudents.map(student =>
      student._id === studentId ? { ...student, isActive: !currentStatus } : student
    ));

    try {
      await adminService.toggleStudentStatus(studentId);
      // Fetch fresh list silently in the background
      fetchStudents();
      notify.success('Student status updated successfully!');
    } catch (err) {
      notify.error(err.message || 'Failed to toggle student status');
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

      notify.success('Courses assigned successfully!');
      handleCloseDialog();
    } catch (err) {
      notify.error(err.message || 'Failed to assign courses');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && students.length === 0) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="font-poppins h-full">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-medium text-gray-800">Student Management</h1>
            <p className="text-gray-500 mt-1 font-light text-sm md:text-base">View and manage enrolled students</p>
          </div>
          <Tooltip title={showFilters ? "Hide Filters" : "Show Filters"} placement="left">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center border shadow-sm ${showFilters
                ? 'bg-theme/10 text-theme border-theme/20'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              {showFilters ? <FilterX size={20} strokeWidth={2} /> : <Filter size={20} strokeWidth={2} />}
            </button>
          </Tooltip>
        </div>

        <Collapse in={showFilters}>
          <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-grow w-full">
                <label className="block text-xs font-medium text-gray-500 mb-1">Search by Name</label>
                <input
                  type="text"
                  placeholder="Type to search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all"
                />
              </div>
              <div className="w-full md:w-48">
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all"
                >
                  <option value="all">All Students</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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

        {/* Legacy alerts removed in favor of premium toasts */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 w-full">
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
            labelRowsPerPage="Students per page"
            className="border-t border-gray-100 bg-gray-50/50"
            sx={{
              '.MuiTablePagination-toolbar': {
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', sm: 'flex-end' },
              },
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontFamily: 'Poppins',
                fontSize: '0.875rem',
                color: '#6b7280',
              },
              '.MuiTablePagination-select': {
                fontFamily: 'Poppins',
              }
            }}
          />
        </div>

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
      </div>
    </MainLayout>
  );
};

export default StudentManagement;
