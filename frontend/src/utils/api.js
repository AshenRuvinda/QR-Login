import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : '', // Use proxy in development
});




// Request interceptor to automatically add auth headers
api.interceptors.request.use(
  (config) => {
    try {
      const userData = localStorage.getItem('qr_attendance_user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.password) {
          const authString = user.role === 'admin' ? 
            `${user.username}:${user.password}` : 
            `${user.username}:${user.password}`;
          config.headers.Authorization = `Basic ${btoa(authString)}`;
        }
      }
    } catch (error) {
      console.error('Error setting auth header:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401, the token might be expired/invalid
    if (error.response?.status === 401) {
      console.log('Received 401, clearing auth data');
      localStorage.removeItem('qr_attendance_user');
      
      // Only redirect if we're not already on a login page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;