import React, { useState, useEffect, useCallback } from 'react';
import { TablePagination } from '@mui/material';
import { Search, Plus } from 'lucide-react';
import adminService from '../../services/adminService';
import notify from '../../utils/notify';
import MainLayout from '../layout/MainLayout';
import FacultyFormDialog from './faculty/FacultyFormDialog';
import AssignCoursesDialog from './faculty/AssignCoursesDialog';
import FacultyTable from './faculty/FacultyTable';

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Faculty Create/Edit State
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'instructor',
    isActive: true,
  });

  // Assign Course State
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedFacultyForAssign, setSelectedFacultyForAssign] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchFaculty = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        name: debouncedSearch,
      };

      const response = await adminService.getAllFaculty(params);
      setFaculty(response.data || []);
      setTotalRecords(response.total || 0);
    } catch (err) {
      notify.error(err.message || 'Failed to fetch faculty');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch]);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (facultyMember = null) => {
    if (facultyMember) {
      setEditingFaculty(facultyMember);
      setFormData({
        name: facultyMember.name,
        email: facultyMember.email,
        password: '',
        role: facultyMember.role,
        isActive: facultyMember.isActive,
      });
    } else {
      setEditingFaculty(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'instructor',
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFaculty(null);
  };

  const handleSubmit = async () => {
    try {
      const submitData = { ...formData };
      if (!submitData.password) {
        delete submitData.password;
      }

      if (editingFaculty) {
        await adminService.updateFaculty(editingFaculty._id, submitData);
      } else {
        if (!formData.password) {
          notify.error('Password is required for new faculty');
          return;
        }
        await adminService.createFaculty(submitData);
      }
      fetchFaculty();
      handleCloseDialog();
      notify.success(editingFaculty ? 'Faculty updated' : 'Faculty created');
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to save faculty');
    }
  };

  const handleDelete = async (facultyId) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) {
      return;
    }
    try {
      await adminService.deleteFaculty(facultyId);
      fetchFaculty();
      notify.success('Faculty deleted');
    } catch (err) {
      notify.error(err.message || 'Failed to delete faculty');
    }
  };

  const handleToggleStatus = async (facultyMember) => {
    try {
      await adminService.updateFaculty(facultyMember._id, {
        isActive: !facultyMember.isActive,
        role: facultyMember.role,
      });
      fetchFaculty();
      notify.success(`Faculty ${facultyMember.isActive ? 'deactivated' : 'activated'}`);
    } catch (err) {
      notify.error(err.message || 'Failed to update status');
    }
  };

  const handleOpenAssignDialog = async (facultyMember) => {
    setSelectedFacultyForAssign(facultyMember);
    setAssignDialogOpen(true);
    setCoursesLoading(true);

    try {
      const response = await adminService.getAllCourses();
      setAllCourses(response.data || []);

      const currentIds = facultyMember.assignedCourses
        ? facultyMember.assignedCourses.map((c) => (typeof c === 'object' ? c._id : c))
        : [];
      setSelectedCourseIds(currentIds);
    } catch (err) {
      notify.error('Failed to fetch courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleToggleCourse = (courseId) => {
    setSelectedCourseIds((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleAssignSubmit = async () => {
    if (!selectedFacultyForAssign) return;
    try {
      await adminService.assignCoursesToFaculty(selectedFacultyForAssign._id, selectedCourseIds);
      fetchFaculty();
      setAssignDialogOpen(false);
      notify.success('Courses assigned successfully');
    } catch (err) {
      notify.error(err.message || 'Failed to assign courses');
    }
  };

  if (loading && faculty.length === 0) {
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
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-medium text-gray-800">Faculty Management</h1>
            <p className="text-gray-500 mt-1 font-light">Manage instructors and their course assignments</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="w-full sm:w-64 pl-10 pr-4 py-2 relative bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all text-sm"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Search size={18} />
              </div>
            </div>
            <button
              onClick={() => handleOpenDialog()}
              className="bg-theme hover:bg-theme-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow flex items-center justify-center gap-2 text-sm whitespace-nowrap"
            >
              <Plus size={18} strokeWidth={2} />
              Add Faculty
            </button>
          </div>
        </div>

        {/* Legacy alerts removed in favor of premium toasts */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4 w-full">
          <FacultyTable
            faculty={faculty}
            onEdit={handleOpenDialog}
            onDelete={handleDelete}
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
            labelRowsPerPage="Faculty per page"
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

        <FacultyFormDialog
          open={openDialog}
          onClose={handleCloseDialog}
          editingFaculty={editingFaculty}
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
        />

        <AssignCoursesDialog
          open={assignDialogOpen}
          onClose={() => setAssignDialogOpen(false)}
          facultyMember={selectedFacultyForAssign}
          allCourses={allCourses}
          selectedCourseIds={selectedCourseIds}
          onToggleCourse={handleToggleCourse}
          onSubmit={handleAssignSubmit}
          loading={coursesLoading}
        />
      </div>
    </MainLayout>
  );
};

export default FacultyManagement;
