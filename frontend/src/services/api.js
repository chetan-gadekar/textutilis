import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorData = error.response?.data;
      
      // Check if it's a session invalidation error (single device login)
      if (errorData?.code === 'SESSION_INVALIDATED') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Store message in sessionStorage to show on login page
        sessionStorage.setItem('sessionMessage', errorData.message || 'You have been logged in from another device. Please login again.');
        window.location.href = '/login';
      } else {
        // Regular unauthorized error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
