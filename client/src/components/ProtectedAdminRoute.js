import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  // Use the token for authentication check
  const token = localStorage.getItem('token');
  
  // Check both userData and user to support both formats
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const legacyUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Check if either storage method indicates admin role
  const isAdmin = 
    userData.role === 'admin' || 
    legacyUser.role === 'admin' || 
    legacyUser.user?.role === 'admin';

  // Log the authentication status for debugging
  console.log('Protected Admin Route Check:', { 
    hasToken: Boolean(token), 
    isAdmin,
    userData,
    legacyUser
  });

  // Redirect to login if not authenticated as admin
  if (!token || !isAdmin) {
    console.log('Not authenticated as admin, redirecting to login');
    return <Navigate to="/admin-login" replace />;
  }

  // User is authenticated as admin, render children
  console.log('Authenticated as admin, rendering admin content');
  return children;
};

export default ProtectedAdminRoute;
