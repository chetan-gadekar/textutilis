import api from './api';

const assignmentService = {
  // Super Instructor - Assignments
  createAssignment: async (courseId, assignmentData) => {
    const response = await api.post(`/super-instructor/courses/${courseId}/assignments`, assignmentData);
    return response.data;
  },
  getAssignments: async (courseId) => {
    const response = await api.get(`/super-instructor/courses/${courseId}/assignments`);
    return response.data;
  },
  updateAssignment: async (assignmentId, assignmentData) => {
    const response = await api.put(`/super-instructor/assignments/${assignmentId}`, assignmentData);
    return response.data;
  },
  deleteAssignment: async (assignmentId) => {
    const response = await api.delete(`/super-instructor/assignments/${assignmentId}`);
    return response.data;
  },
  // Instructor - Submissions
  getSubmissions: async (assignmentId) => {
    const response = await api.get(`/instructor/assignments/${assignmentId}/submissions`);
    return response.data;
  },
  // Student - Assignments
  getStudentAssignments: async (courseId) => {
    const response = await api.get(`/student/courses/${courseId}/assignments`);
    return response.data;
  },
  getMySubmissions: async () => {
    const response = await api.get('/student/submissions');
    return response.data;
  },
  submitAssignment: async (assignmentId, fileUrl, fileName) => {
    const response = await api.post(`/student/assignments/${assignmentId}/submit`, {
      fileUrl,
      fileName,
    });
    return response.data;
  },
};

export default assignmentService;
