import axios from 'axios';
import { toast } from 'react-toastify';

// Determine the right backend URL based on environment
const getBaseUrl = () => {
  // Check for a specific override in localStorage (for testing/development)
  const overrideUrl = localStorage.getItem('gungun_api_url');
  if (overrideUrl) {
    console.log('Using API URL override:', overrideUrl);
    return overrideUrl;
  }
  
  // Check if we're in production or development
  if (process.env.NODE_ENV === 'production') {
    console.log('Using production API path: /api');
    return '/api';  // Use relative path in production
  }
  
  // For local development, use localhost
  console.log('Using development API URL: http://localhost:5001/api');
  return 'http://localhost:5001/api';
};

// Create axios instance with custom config
const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Adding auth token to request');
      } else {
        console.log('No auth token found');
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log full response for debugging
    console.log('Axios Response:', {
      data: response.data,
      status: response.status,
      headers: response.headers
    });

    // Return the standard response (don't modify the structure)
    return response;
  },
  (error) => {
    // Log full error details
    console.error('Axios Error:', {
      response: error.response,
      request: error.request,
      message: error.message,
      config: error.config
    });

    // Centralized error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const errorMessage = error.response.data?.message || 'An error occurred';

      switch (status) {
        case 401:
          console.error('Unauthorized access');
          // Clear all auth data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('refreshToken');
          toast.error('Your session has expired. Please login again.');
          
          // Only redirect if we're not already on the login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Forbidden access');
          toast.error('You don\'t have permission to access this resource');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Internal server error');
          toast.error('Something went wrong. Please try again later.');
          break;
        default:
          console.error(`Unhandled error status: ${status}`);
      }

      // Throw the error to be caught by the caller
      return Promise.reject(error);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      toast.error('Server not responding. Please try again later.');
      return Promise.reject(new Error('No response from server'));
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
      return Promise.reject(error);
    }
  }
);

export default api;
