import api from './api';

const moduleService = {
  createModule: async (courseId, moduleData) => {
    const response = await api.post(`/super-instructor/courses/${courseId}/modules`, moduleData);
    return response.data;
  },
  getModules: async (courseId) => {
    const response = await api.get(`/super-instructor/courses/${courseId}/modules`);
    return response.data;
  },
  getModule: async (moduleId) => {
    const response = await api.get(`/super-instructor/modules/${moduleId}`);
    return response.data;
  },
  updateModule: async (moduleId, moduleData) => {
    const response = await api.put(`/super-instructor/modules/${moduleId}`, moduleData);
    return response.data;
  },
  deleteModule: async (moduleId) => {
    const response = await api.delete(`/super-instructor/modules/${moduleId}`);
    return response.data;
  },
};

export default moduleService;
