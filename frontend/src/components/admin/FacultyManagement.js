import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import adminService from '../../services/adminService';
import MainLayout from '../layout/MainLayout';
import FacultyFormDialog from './faculty/FacultyFormDialog';
import AssignCoursesDialog from './faculty/AssignCoursesDialog';
import FacultyTable from './faculty/FacultyTable';

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllFaculty();
      setFaculty(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch faculty');
    } finally {
      setLoading(false);
    }
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
    setError(null);
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
        if (!submitData.password) {
          setError('Password is required for new faculty');
          return;
        }
        await adminService.createFaculty(submitData);
      }
      fetchFaculty();
      handleCloseDialog();
      setSuccess(editingFaculty ? 'Faculty updated' : 'Faculty created');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save faculty');
    }
  };

  const handleDelete = async (facultyId) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) {
      return;
    }
    try {
      await adminService.deleteFaculty(facultyId);
      fetchFaculty();
      setSuccess('Faculty deleted');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete faculty');
    }
  };

  const handleToggleStatus = async (facultyMember) => {
    try {
      await adminService.updateFaculty(facultyMember._id, {
        isActive: !facultyMember.isActive,
        role: facultyMember.role,
      });
      fetchFaculty();
      setSuccess(`Faculty ${facultyMember.isActive ? 'deactivated' : 'activated'}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleOpenAssignDialog = async (facultyMember) => {
    setSelectedFacultyForAssign(facultyMember);
    setAssignDialogOpen(true);
    setCoursesLoading(true);
    setError(null);

    try {
      const response = await adminService.getAllCourses();
      setAllCourses(response.data || []);

      const currentIds = facultyMember.assignedCourses
        ? facultyMember.assignedCourses.map((c) => (typeof c === 'object' ? c._id : c))
        : [];
      setSelectedCourseIds(currentIds);
    } catch (err) {
      setError('Failed to fetch courses');
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
      setSuccess('Courses assigned successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to assign courses');
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
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Faculty Management
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Faculty
          </Button>
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

        <FacultyTable
          faculty={faculty}
          onEdit={handleOpenDialog}
          onDelete={handleDelete}
          onAssignCourses={handleOpenAssignDialog}
          onToggleStatus={handleToggleStatus}
        />

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
      </Box>
    </MainLayout>
  );
};

export default FacultyManagement;
