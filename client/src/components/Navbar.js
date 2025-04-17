import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../utils/authUtils';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Function to check and update user state
    const checkUserAuth = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    };

    // Check initially
    checkUserAuth();

    // Add event listener for storage changes
    window.addEventListener('storage', checkUserAuth);

    // Custom event listener for auth changes
    window.addEventListener('authChange', checkUserAuth);

    return () => {
      window.removeEventListener('storage', checkUserAuth);
      window.removeEventListener('authChange', checkUserAuth);
    };
  }, []);

  const handleLogout = () => {
    logout(navigate);
    
    // Dispatch auth change event
    window.dispatchEvent(new Event('authChange'));
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <i className="fas fa-bus text-3xl text-primary group-hover:scale-110 transition-transform duration-300"></i>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                EasyBus
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 p-2 rounded-md"
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/search" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors duration-300">
              <i className="fas fa-search"></i>
              <span>Search</span>
            </Link>
            
            {user ? (
              <>
                <Link to="/my-bookings" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors duration-300">
                  <i className="fas fa-ticket-alt"></i>
                  <span>My Bookings</span>
                </Link>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors duration-300">
                  <i className="fas fa-user"></i>
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors duration-300 flex items-center space-x-2"
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors duration-300">
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Login</span>
                </Link>
                <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary transition-colors duration-300 flex items-center space-x-2 transform hover:scale-105">
                  <i className="fas fa-user-plus"></i>
                  <span>Register</span>
                </Link>
              </>
            )}
            
            <Link to="/agent-login" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors duration-300">
              <i className="fas fa-user-tie"></i>
              <span>Agent Portal</span>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/search" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 flex items-center space-x-2 transition-all duration-300">
              <i className="fas fa-search"></i>
              <span>Search</span>
            </Link>

            {user ? (
              <>
                <Link to="/my-bookings" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 flex items-center space-x-2 transition-all duration-300">
                  <i className="fas fa-ticket-alt"></i>
                  <span>My Bookings</span>
                </Link>
                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 flex items-center space-x-2 transition-all duration-300">
                  <i className="fas fa-user"></i>
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-500 text-white hover:bg-red-600 flex items-center space-x-2 transition-all duration-300"
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 flex items-center space-x-2 transition-all duration-300">
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Login</span>
                </Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-white hover:bg-secondary flex items-center space-x-2 transition-all duration-300">
                  <i className="fas fa-user-plus"></i>
                  <span>Register</span>
                </Link>
              </>
            )}

            <Link to="/agent-login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 flex items-center space-x-2 transition-all duration-300">
              <i className="fas fa-user-tie"></i>
              <span>Agent Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
