import axios from 'axios';

// Determine the base URL based on environment
const getBaseUrl = () => {
  // Check if we have an environment variable for the API URL
  const envApiUrl = process.env.REACT_APP_API_BASEURL;
  
  // In production (on Render), use the relative path which will be handled by our Express server
  if (process.env.NODE_ENV === 'production') {
    return envApiUrl || '/api';
  }
  
  // In development, check for localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // If running locally, we'll rely on the proxy setting in package.json
    return '/api';
  }
  
  // Fallback
  return '/api';
};

// Create axios instance with better error handling
const instance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // Add a timeout to avoid hanging requests
});

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    console.log('Making API request to:', config.baseURL + config.url);
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
    console.log('API response received:', response.config.baseURL + response.config.url);
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
