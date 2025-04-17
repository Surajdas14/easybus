import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/axios';

const AdminHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    try {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      // Clear axios default headers
      delete api.defaults.headers.common['Authorization'];

      // Show success toast
      toast.success('Logged out successfully');

      // Redirect to login page
      navigate('/admin-login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'fas fa-chart-line' },
    { path: '/admin/buses', label: 'Buses', icon: 'fas fa-bus' },
    { path: '/admin/agents', label: 'Agents', icon: 'fas fa-users-cog' },
    { path: '/admin/bookings', label: 'Bookings', icon: 'fas fa-ticket-alt' },
    { path: '/admin/users', label: 'Users', icon: 'fas fa-users' },
    { path: '/admin/settings', label: 'Settings', icon: 'fas fa-cog' },
  ];

  return (
    <header className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/admin/dashboard" className="text-xl font-bold flex items-center">
            <i className="fas fa-bus-alt mr-2"></i>
            EasyBus Admin
          </Link>

          <nav className="hidden md:flex space-x-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  location.pathname === item.path
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <i className={`${item.icon} mr-2`}></i>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
