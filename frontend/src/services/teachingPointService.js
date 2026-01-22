import api from './api';

const teachingPointService = {
  updateTodayTeachingPoints: async (teachingPoints) => {
    const response = await api.put('/instructor/teaching-points/today', { teachingPoints });
    return response.data;
  },
  getTodayTeachingPoints: async () => {
    const response = await api.get('/instructor/teaching-points/today');
    return response.data;
  },
};

export default teachingPointService;
