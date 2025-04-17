import { toast } from 'react-toastify';

export const logout = (navigate) => {
  try {
    // Clear user data from localStorage - using correct keys
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Show logout success message
    toast.info('Logged out successfully');
    
    // Redirect to login page
    if (navigate) {
      navigate('/login');
    } else {
      // Fallback redirect
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Logout error:', error);
    toast.error('Error logging out');
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    // Check if token exists
    return true;
    
    // Note: If you implement token expiration checking, you could add it here
    // const expiresAt = localStorage.getItem('tokenExpiry');
    // return Date.now() < expiresAt;
  } catch (error) {
    console.error('Authentication check error:', error);
    return false;
  }
};

// Get current user details
export const getCurrentUser = () => {
  const userString = localStorage.getItem('user');
  if (!userString) return null;

  try {
    const user = JSON.parse(userString);
    console.log('Found user data in localStorage:', user);
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};
