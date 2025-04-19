import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/axios';

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'user', 'agent'

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings');
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      toast.success('Booking status updated successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    
    // Check if booking.user exists first to avoid errors
    if (!booking.user) return false;
    
    if (activeTab === 'user') {
      // Show bookings where role is 'user' or undefined/null (assume regular users)
      return booking.user.role === 'user' || booking.user.role === 'customer' || !booking.user.role;
    }
    
    if (activeTab === 'agent') {
      // Only show bookings specifically marked as agent
      return booking.user.role === 'agent';
    }
    
    return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Bookings Management</h1>
        <button
          onClick={fetchBookings}
          className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2"
        >
          <i className="fas fa-sync-alt"></i>
          <span>Refresh</span>
        </button>
      </div>

      {/* Booking Type Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          className={`py-2 px-4 ${
            activeTab === 'all'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All Bookings
        </button>
        <button
          className={`py-2 px-4 ${
            activeTab === 'user'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('user')}
        >
          User Bookings
        </button>
        <button
          className={`py-2 px-4 ${
            activeTab === 'agent'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('agent')}
        >
          Agent Bookings
        </button>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking Info</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User/Agent</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bus Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Journey</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <i className="fas fa-circle-notch fa-spin"></i>
                      <span>Loading bookings...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No bookings found for {activeTab === 'all' ? 'any type' : `${activeTab}s`}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 break-all">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">ID:</span> 
                          <span>{booking._id}</span>
                        </div>
                        <div className="text-xs mt-1 bg-blue-50 p-1 rounded">
                          <span className="font-bold">Ref:</span> GUNGUN-{booking._id.substring(0, 8).toUpperCase()}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{new Date(booking.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 font-medium">{booking.user?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{booking.user?.phone || 'No phone'}</div>
                      <div className="text-sm text-gray-500">{booking.user?.email || 'No email'}</div>
                      <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 inline-block mt-1">
                        {booking.user?.role || 'user'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 font-medium">{booking.bus?.busNumber || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{booking.bus?.busType || 'Standard'}</div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Date:</span> {booking.date ? new Date(booking.date).toLocaleDateString() : 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Time:</span> {booking.departureTime || booking.bus?.departureTime || 'Not specified'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {booking.from || booking.bus?.source || 'Unknown'} → {booking.to || booking.bus?.destination || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Seats:</span> {booking.seats?.join(', ') || 'None'}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Amount:</span> ₹{booking.fareInRupees || 0}
                      </div>
                      {booking.passengers && booking.passengers.length > 0 && (
                        <details className="mt-1">
                          <summary className="text-xs text-blue-600 cursor-pointer">View Passengers</summary>
                          <div className="mt-1 text-xs bg-gray-50 p-1 rounded">
                            {booking.passengers.map((passenger, idx) => (
                              <div key={idx} className="mb-1">
                                <div>Name: {passenger.name}</div>
                                <div>Age: {passenger.age} | Gender: {passenger.gender}</div>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <select
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                          className="border rounded p-1 text-sm w-full"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingsManagement;
