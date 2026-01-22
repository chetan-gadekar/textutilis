import api from './api';

const studentService = {
  getVideoProgress: async (contentId) => {
    const response = await api.get(`/student/content/${contentId}/progress`);
    return response.data;
  },
  saveVideoProgress: async (progressData) => {
    const response = await api.post('/student/content/progress', progressData);
    return response.data;
  },
  saveContentProgress: async (contentId, topicId, moduleId, courseId, videoPosition, isCompleted) => {
    const response = await api.post('/student/content/progress', {
      contentId,
      topicId,
      moduleId,
      courseId,
      videoPosition,
      isCompleted,
    });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/student/profile');
    return response.data;
  },
};

export default studentService;
