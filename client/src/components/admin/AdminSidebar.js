import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin-login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: 'fas fa-chart-line', label: 'Dashboard' },
    { path: '/admin/agents', icon: 'fas fa-users', label: 'Agents' },
    { path: '/admin/buses', icon: 'fas fa-bus', label: 'Buses' },
    { path: '/admin/bookings', icon: 'fas fa-ticket-alt', label: 'Bookings' },
    { path: '/admin/users', icon: 'fas fa-user-friends', label: 'Users' },
    { path: '/admin/settings', icon: 'fas fa-cog', label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">GUNGUN Admin</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
              location.pathname === item.path ? 'bg-gray-700 text-white' : ''
            }`}
          >
            <i className={`${item.icon} w-5`}></i>
            <span className="ml-3">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded transition-colors"
        >
          <i className="fas fa-sign-out-alt w-5"></i>
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
