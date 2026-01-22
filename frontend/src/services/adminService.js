import api from './api';

const adminService = {
  // Students
  getAllStudents: async (params = {}) => {
    const response = await api.get('/admin/students', { params });
    return response.data;
  },
  toggleStudentStatus: async (studentId) => {
    const response = await api.patch(`/admin/students/${studentId}/toggle-status`);
    return response.data;
  },
  assignCoursesToStudent: async (studentId, courseIds) => {
    const response = await api.post(`/admin/students/${studentId}/assign-courses`, { courseIds });
    return response.data;
  },
  getStudentEnrollments: async (studentId) => {
    const response = await api.get(`/admin/students/${studentId}/enrollments`);
    return response.data;
  },
  // Faculty
  getAllFaculty: async () => {
    const response = await api.get('/admin/faculty');
    return response.data;
  },
  createFaculty: async (facultyData) => {
    const response = await api.post('/admin/faculty', facultyData);
    return response.data;
  },
  updateFaculty: async (facultyId, facultyData) => {
    const response = await api.put(`/admin/faculty/${facultyId}`, facultyData);
    return response.data;
  },
  deleteFaculty: async (facultyId) => {
    const response = await api.delete(`/admin/faculty/${facultyId}`);
    return response.data;
  },
  assignCoursesToFaculty: async (facultyId, courseIds) => {
    const response = await api.post(`/admin/faculty/${facultyId}/assign-courses`, { courseIds });
    return response.data;
  },
  // Teaching Points
  getAllTeachingPoints: async (params = {}) => {
    const response = await api.get('/admin/teaching-points', { params });
    return response.data;
  },
  getAllCourses: async () => {
    const response = await api.get('/admin/courses');
    return response.data;
  },
};

export default adminService;
