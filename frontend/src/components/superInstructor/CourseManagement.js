import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material'; // Keeping MUI dialog for complex form handling, styling its contents with Tailwind
import AddIcon from '@mui/icons-material/Add';
import { LayoutList, Edit3, Trash } from 'lucide-react';
import courseService from '../../services/courseService';
import MainLayout from '../layout/MainLayout';
import FileUpload from '../common/FileUpload';
import LoadingButton from '../common/LoadingButton';
import notify from '../../utils/notify';

const CourseManagement = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isVisible: true,
    bannerImage: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourses();
      setCourses(response.data || []);
    } catch (err) {
      notify.error(err.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        description: course.description || '',
        isVisible: course.isVisible,
        bannerImage: course.bannerImage || '',
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        description: '',
        isVisible: true,
        bannerImage: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      isVisible: true,
      bannerImage: '',
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (editingCourse) {
        await courseService.updateCourse(editingCourse._id, formData);
      } else {
        await courseService.createCourse(formData);
      }
      notify.success(`Course ${editingCourse ? 'updated' : 'created'} successfully!`);
      fetchCourses();
      handleCloseDialog();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to save course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? All content and assignments will be deleted.')) {
      return;
    }
    try {
      await courseService.deleteCourse(courseId);
      notify.success('Course deleted successfully');
      fetchCourses();
    } catch (err) {
      notify.error(err.message || 'Failed to delete course');
    }
  };

  if (loading) {
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
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-medium text-gray-800">Course Management</h1>
            <p className="text-gray-500 mt-1 font-light">Create, edit, and organize your courses</p>
          </div>
          <LoadingButton
            onClick={() => handleOpenDialog()}
            startIcon={<AddIcon fontSize="small" />}
            className="bg-theme hover:bg-theme-dark text-white font-medium py-2 px-5 rounded-lg transition-colors duration-200 shadow-sm"
            sx={{
              bgcolor: '#6A4E9E',
              '&:hover': { bgcolor: '#5A3E8E' },
              borderRadius: '8px'
            }}
          >
            Create Course
          </LoadingButton>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Banner
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Visibility
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="text-lg font-medium text-gray-600">No courses found</p>
                        <p className="text-sm text-gray-400 mt-1">Create your first course to get started!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {course.bannerImage ? (
                          <img
                            src={course.bannerImage}
                            alt={course.title}
                            className="h-12 w-20 rounded-md object-cover shadow-sm border border-gray-100"
                          />
                        ) : (
                          <div className="h-12 w-20 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-800">{course.title}</div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {course.description ? course.description : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${course.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {course.isVisible ? 'Visible' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2 items-center">
                          <Tooltip title="Manage Course Structure" placement="top">
                            <button
                              onClick={() => navigate(`/super-instructor/courses/${course._id}/structure`)}
                              className="p-2.5 bg-theme/5 hover:bg-theme/10 text-theme hover:text-theme-dark rounded-xl transition-colors"
                            >
                              <LayoutList size={20} strokeWidth={2} />
                            </button>
                          </Tooltip>
                          <Tooltip title="Edit Course" placement="top">
                            <button
                              onClick={() => handleOpenDialog(course)}
                              className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-500 hover:text-blue-700 rounded-xl transition-colors"
                            >
                              <Edit3 size={20} strokeWidth={2} />
                            </button>
                          </Tooltip>
                          <Tooltip title="Delete Course" placement="top">
                            <button
                              onClick={() => handleDelete(course._id)}
                              className="p-2.5 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-xl transition-colors"
                            >
                              <Trash size={20} strokeWidth={2} />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ style: { borderRadius: '12px', margin: '16px', maxHeight: 'none' } }}>
          <DialogTitle className="font-poppins font-medium text-gray-800 border-b border-gray-100 py-3 px-5 text-lg">
            {editingCourse ? 'Edit Course' : 'Create Course'}
          </DialogTitle>
          <DialogContent className="font-poppins overflow-y-auto px-5 py-3" style={{ paddingBottom: '0.5rem', paddingTop: '0.5rem' }}>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Course Title *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-theme/20 focus:border-theme outline-none transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g. Introduction to Programming"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea
                  rows="2"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-theme/20 focus:border-theme outline-none transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your course..."
                ></textarea>
              </div>

              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-theme/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-theme"></div>
                  <span className="ml-2 text-xs font-semibold text-gray-700">Course Visible to Students</span>
                </label>
              </div>

              <div className="p-3 bg-gray-50 rounded border border-gray-100">
                <label className="block text-xs font-semibold text-gray-700 mb-2">Course Banner Image</label>
                {formData.bannerImage && (
                  <div className="mb-2 relative group">
                    <img
                      src={formData.bannerImage}
                      alt="Banner Preview"
                      className="w-full h-20 object-cover rounded border border-gray-200"
                    />
                  </div>
                )}
                <div className="w-full mt-1">
                  <FileUpload
                    label={formData.bannerImage ? "Replace Banner Image" : "Upload Banner Image"}
                    accept="image/*"
                    onUploadSuccess={(url) => setFormData({ ...formData, bannerImage: url })}
                  />
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogActions className="p-3 px-5 border-t border-gray-100">
            <button
              onClick={handleCloseDialog}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <LoadingButton
              onClick={handleSubmit}
              loading={isSubmitting}
              loadingText={editingCourse ? 'Updating...' : 'Creating...'}
              className="px-4 py-1.5 text-sm bg-theme hover:bg-theme-dark text-white font-medium rounded-md shadow-sm transition ml-2"
              sx={{
                bgcolor: '#6A4E9E',
                '&:hover': { bgcolor: '#5A3E8E' },
                height: '36px'
              }}
            >
              {editingCourse ? 'Update Course' : 'Create Course'}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default CourseManagement;
