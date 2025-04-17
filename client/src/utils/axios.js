import axios from 'axios';

// Create axios instance with better error handling
const instance = axios.create({
  baseURL: '/api',  // Changed from absolute URL to relative URL to work with proxy
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // Add a timeout to avoid hanging requests
});

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    console.log('Making API request to:', config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => {
    console.log('API response received:', response.config.url);
    return response;
  },
  async (error) => {
    console.error('API response error:', error.message);
    
    // Handle different error cases
    if (error.response) {
      // Server responded with error status
      console.error('Response error data:', error.response.data);
      console.error('Response error status:', error.response.status);
      
      if (error.response.status === 401) {
        // Unauthorized - clear credentials
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('No response received:', error.request);
    }
    
    return Promise.reject(error);
  }
);

export default instance;
