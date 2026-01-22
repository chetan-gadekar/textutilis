import api from './api';

const courseService = {
  // Super Instructor - Courses
  createCourse: async (courseData) => {
    const response = await api.post('/super-instructor/courses', courseData);
    return response.data;
  },
  getCourses: async () => {
    const response = await api.get('/super-instructor/courses');
    return response.data;
  },
  getCourse: async (courseId) => {
    const response = await api.get(`/super-instructor/courses/${courseId}`);
    return response.data;
  },
  updateCourse: async (courseId, courseData) => {
    const response = await api.put(`/super-instructor/courses/${courseId}`, courseData);
    return response.data;
  },
  deleteCourse: async (courseId) => {
    const response = await api.delete(`/super-instructor/courses/${courseId}`);
    return response.data;
  },
  // Content
  createContent: async (courseId, contentData) => {
    const response = await api.post(`/super-instructor/courses/${courseId}/content`, contentData);
    return response.data;
  },
  getContent: async (courseId) => {
    const response = await api.get(`/super-instructor/courses/${courseId}/content`);
    return response.data;
  },
  updateContent: async (contentId, contentData) => {
    const response = await api.put(`/super-instructor/content/${contentId}`, contentData);
    return response.data;
  },
  deleteContent: async (contentId) => {
    const response = await api.delete(`/super-instructor/content/${contentId}`);
    return response.data;
  },
  // Student - Courses
  getStudentCourses: async () => {
    const response = await api.get('/student/courses');
    return response.data;
  },
  getStudentCourseStructure: async (courseId) => {
    const response = await api.get(`/student/courses/${courseId}/structure`);
    return response.data;
  },
  getStudentCourseContent: async (courseId) => {
    const response = await api.get(`/student/courses/${courseId}/content`);
    return response.data;
  },
  getStudentCourseProgress: async (courseId) => {
    const response = await api.get(`/student/courses/${courseId}/progress`);
    return response.data;
  },
  getStudentContent: async (contentId) => {
    const response = await api.get(`/student/content/${contentId}`);
    return response.data;
  },
};

export default courseService;
