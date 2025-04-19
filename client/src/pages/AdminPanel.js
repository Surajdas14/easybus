import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BusManagement from './admin/BusManagement';

const AdminPanel = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/admin', icon: 'fas fa-chart-line', label: 'Dashboard' },
    { path: '/admin/buses', icon: 'fas fa-bus', label: 'Buses' },
    { path: '/admin/agents', icon: 'fas fa-user-tie', label: 'Agents' },
    { path: '/admin/bookings', icon: 'fas fa-ticket-alt', label: 'Bookings' },
    { path: '/admin/users', icon: 'fas fa-users', label: 'Users' },
    { path: '/admin/settings', icon: 'fas fa-cog', label: 'Settings' }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <Link to="/admin" className="flex items-center space-x-3">
            <i className="fas fa-bus text-3xl text-blue-400"></i>
            <span className="text-xl font-bold">GUNGUN Admin</span>
          </Link>
        </div>
        <nav className="mt-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-6 py-3 transition-colors duration-200 ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/admin-login';
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200 flex items-center space-x-2"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
          <ToastContainer position="top-right" autoClose={3000} />
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
