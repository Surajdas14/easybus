import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/axios';

const AdminHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    const handleClick = (e) => {
      // Close when clicking outside the navbar
      if (isOpen && !e.target.closest('.navbar-content') && !e.target.closest('.mobile-menu-button')) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handleClick);
    };
  }, [isOpen]);

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
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 navbar-content">
          <Link to="/admin/dashboard" className="text-xl font-bold flex items-center">
            <i className="fas fa-bus-alt mr-2"></i>
            <span className="truncate">GUNGUN Admin</span>
          </Link>

          {/* Mobile menu button */}
          <button 
            className="md:hidden mobile-menu-button focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-5">
              <span 
                className={`absolute h-0.5 w-6 bg-white transform transition duration-300 ease-in-out ${
                  isOpen ? 'rotate-45 translate-y-2' : ''
                }`}
                style={{ top: '0' }}
              ></span>
              <span 
                className={`absolute h-0.5 bg-white transform transition-opacity duration-300 ease-in-out ${
                  isOpen ? 'opacity-0 w-0' : 'opacity-100 w-6'
                }`}
                style={{ top: '10px' }}
              ></span>
              <span 
                className={`absolute h-0.5 w-6 bg-white transform transition duration-300 ease-in-out ${
                  isOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
                style={{ top: '20px' }}
              ></span>
            </div>
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-1 lg:space-x-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-2 lg:px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  location.pathname === item.path
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <i className={`${item.icon} mr-1 lg:mr-2`}></i>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User actions - desktop */}
          <div className="hidden md:flex items-center">
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-2 lg:px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200 flex items-center space-x-1 lg:space-x-2"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation slide-down */}
      <div
        className={`md:hidden bg-gray-800 shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="px-4 pt-2 pb-5 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <i className={`${item.icon} mr-3 w-5 text-center`}></i>
              {item.label}
            </Link>
          ))}
          <div className="pt-2 mt-2 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-md transition-colors"
            >
              <i className="fas fa-sign-out-alt mr-3"></i>
              Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;
