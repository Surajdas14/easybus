import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalBuses: 0,
    activeBuses: 0,
    totalRevenue: 0,
    agents: [],
    recentBookings: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getFullImageUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `http://localhost:5001${path}`;
  };

  useEffect(() => {
    // Verify admin authentication on mount
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const legacyUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    console.log('Dashboard mount - Token:', !!token);
    console.log('Dashboard mount - userData:', userData);
    console.log('Dashboard mount - legacyUser:', legacyUser);
    
    // Check if the user is an admin in either storage format
    const isAdmin = 
      userData.role === 'admin' || 
      legacyUser.role === 'admin' || 
      legacyUser.user?.role === 'admin';
    
    if (!token || !isAdmin) {
      console.log('No admin token or role found, redirecting to login');
      toast.error('Please login with admin credentials to access the dashboard');
      navigate('/admin-login');
      return;
    }

    console.log('Admin authentication verified, proceeding to load dashboard');
    
    // Set authorization header for axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    fetchDashboardStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      console.log('Fetching dashboard stats...');
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Using direct axios call just like in the Buses.js page
      console.log('Making direct axios call to dashboard stats endpoint');
      const response = await axios.get('http://localhost:5001/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Dashboard stats response:', response.data);
      
      // Separately fetch all buses to ensure we're getting the correct count
      const busesResponse = await axios.get('http://localhost:5001/api/admin/buses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Buses data:', busesResponse.data);
      const totalBuses = busesResponse.data.length;
      const activeBuses = busesResponse.data.filter(bus => bus.isActive).length;
      
      console.log(`Using buses data: total=${totalBuses}, active=${activeBuses}`);
      
      setStats({
        totalUsers: response.data.totalUsers || 0,
        totalBookings: response.data.totalBookings || 0,
        // Use the direct count from the buses endpoint instead of the dashboard stats
        totalBuses: totalBuses,
        activeBuses: activeBuses,
        totalRevenue: response.data.totalRevenue || 0,
        agents: response.data.agents || [],
        recentBookings: response.data.recentBookings || []
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      
      // Detailed error logging
      console.error('Full error object:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.config
      });

      setError(error.message);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Unauthorized. Please login again');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userData'); // Clear userData as well
        navigate('/admin-login');
      } else {
        toast.error(`Failed to fetch dashboard statistics: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-red-600';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-red-800">
          <p className="font-medium">Error loading dashboard</p>
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="rounded-full p-3 bg-blue-100">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="rounded-full p-3 bg-green-100">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="rounded-full p-3 bg-purple-100">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Buses</p>
                  <div className="flex flex-col">
                    <p className="text-lg font-semibold text-gray-900">Total: {stats.totalBuses}</p>
                    <p className="text-sm text-green-600">Active: {stats.activeBuses}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="rounded-full p-3 bg-yellow-100">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₹{stats.totalRevenue.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((booking) => (
                  <div key={booking._id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {booking.user?.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.bus?.busNumber} - {booking.bus?.source} to {booking.bus?.destination}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ₹{((booking.totalAmount || booking.fareInRupees || 0).toLocaleString('en-IN'))}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">No recent bookings</div>
              )}
            </div>
          </div>

          {/* Top Agents */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Top Agents</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {stats.agents.length > 0 ? (
                stats.agents.map((agent) => (
                  <div key={agent._id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {agent.logo && (
                          <img
                            src={getFullImageUrl(agent.logo)}
                            alt={agent.agencyName}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/40?text=A';
                            }}
                          />
                        )}
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{agent.agencyName}</p>
                          <p className="text-sm text-gray-500">{agent.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {agent.totalBookings} bookings
                        </p>
                        <p className="text-sm text-gray-500">{agent.commission}% commission</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">No agents found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
