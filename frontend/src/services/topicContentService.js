import api from './api';

const topicContentService = {
  createContent: async (topicId, contentData) => {
    const response = await api.post(`/super-instructor/topics/${topicId}/content`, contentData);
    return response.data;
  },
  getContent: async (topicId) => {
    const response = await api.get(`/super-instructor/topics/${topicId}/content`);
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
};

export default topicContentService;
