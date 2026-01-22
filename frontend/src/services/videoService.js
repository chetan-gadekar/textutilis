import api from './api';

const videoService = {
  uploadVideo: async (file, name) => {
    const formData = new FormData();
    formData.append('video', file);
    if (name) {
      formData.append('name', name);
    }

    const response = await api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getVideo: async (videoId) => {
    const response = await api.get(`/videos/${videoId}`);
    return response.data;
  },
  getAllVideos: async (params = {}) => {
    const response = await api.get('/videos', { params });
    return response.data;
  },
};

export default videoService;
