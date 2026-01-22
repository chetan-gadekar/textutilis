import api from './api';

const topicService = {
  createTopic: async (moduleId, topicData) => {
    const response = await api.post(`/super-instructor/modules/${moduleId}/topics`, topicData);
    return response.data;
  },
  getTopics: async (moduleId) => {
    const response = await api.get(`/super-instructor/modules/${moduleId}/topics`);
    return response.data;
  },
  getTopic: async (topicId) => {
    const response = await api.get(`/super-instructor/topics/${topicId}`);
    return response.data;
  },
  updateTopic: async (topicId, topicData) => {
    const response = await api.put(`/super-instructor/topics/${topicId}`, topicData);
    return response.data;
  },
  deleteTopic: async (topicId) => {
    const response = await api.delete(`/super-instructor/topics/${topicId}`);
    return response.data;
  },
};

export default topicService;
