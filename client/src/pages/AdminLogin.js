import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { toast } from 'react-toastify';

const AdminLogin = () => {
  // Prefill with the admin credentials from the .env file
  const [formData, setFormData] = useState({
    email: 'admin@gungun.com',
    password: 'Admin@123'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing tokens on mount
    console.log('AdminLogin component mounted');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setDebugInfo(null); // Clear any previous debug info
      console.log('Attempting admin login...', formData);
      
      // Make the login request
      const response = await api.post('/auth/admin/login', formData);
      console.log('Login response:', response);
      
      // With fixed axios config, data is in response.data
      if (response && response.data) {
        const { token, refreshToken, user } = response.data;
        
        console.log('Response data:', response.data);
        console.log('Extracted tokens:', { token, refreshToken });
        console.log('Extracted user:', user);
        
        if (!token) {
          throw new Error('No token received from server');
        }
        
        // Store the admin user data
        const userData = {
          ...(user || {}),
          email: formData.email,
          role: 'admin'
        };
        
        // Store authentication data in localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        console.log('Stored user in localStorage:', userData);
        console.log('Stored token:', token);

        // Update axios default headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Show success message
        toast.success('Admin login successful');
        console.log('Login successful, redirecting...');
        
        // Navigate to admin dashboard
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Store detailed debug info for display
      setDebugInfo({
        error: error.message,
        response: error.response?.data?.message || 'No response data',
        status: error.response?.status || 'No status code',
        fullResponse: JSON.stringify(error.response?.data || {}),
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
      
      // Log error details
      console.error('Error details:', {
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      // Show error message
      toast.error(error.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Default admin credentials have been prefilled for convenience
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <i className={`fas fa-eye${showPassword ? '-slash' : ''} text-gray-400`}></i>
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <i className="fas fa-circle-notch fa-spin"></i>
                  </span>
                  Logging in...
                </>
              ) : (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <i className="fas fa-sign-in-alt"></i>
                  </span>
                  Sign in
                </>
              )}
            </button>
          </div>
        </form>
        
        {/* Debug information */}
        {debugInfo && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm">
            <h3 className="font-bold text-red-800">Debug Information:</h3>
            <p>Error: {debugInfo.error}</p>
            <p>Response: {debugInfo.response}</p>
            <p>Status: {debugInfo.status}</p>
            <details>
              <summary className="cursor-pointer text-blue-800">Full Response</summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs">{debugInfo.fullResponse}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
