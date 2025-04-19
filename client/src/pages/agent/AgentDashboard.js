import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'profile', 'reports'

  useEffect(() => {
    // Check if agent is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user || !user.id) {
      toast.error('Please log in to access agent dashboard');
      navigate('/agent-login');
      return;
    }

    // Fetch agent data and bookings
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get agent details - handle potential errors gracefully
        try {
          // Use the new self/profile endpoint instead of agent ID
          const agentResponse = await axios.get(`/agents/self/profile`);
          if (agentResponse.data) {
            setAgent(agentResponse.data);
          }
        } catch (agentError) {
          console.error('Error fetching agent profile:', agentError);
          // Use user data from localStorage as fallback
          setAgent({
            agencyName: user.name || 'Travel Agency',
            ownerName: user.name || 'Agent',
            agentId: user.userId || user.id.substring(0, 8),
            email: user.email || '',
            // Add placeholder data for other fields
            phone: 'Contact support to update',
            windowNumber: 'N/A',
            commissionRate: 10,
            totalEarnings: 0,
            totalBookings: 0
          });
        }
        
        // Get agent bookings - handle potential errors gracefully
        try {
          const bookingsResponse = await axios.get('/bookings/agent');
          if (bookingsResponse.data && bookingsResponse.data.bookings) {
            setBookings(bookingsResponse.data.bookings);
          }
        } catch (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
          // Use empty bookings array if fetch fails
          setBookings([]);
          // Only show toast if both calls fail - prevent multiple error messages
          if (!agent) {
            toast.warning('Some data could not be loaded. Please try again later.');
          }
        }
        
      } catch (error) {
        console.error('Error fetching agent data:', error);
        toast.error('Failed to load agent data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/agent-login');
    toast.success('Logged out successfully');
  };

  const handlePrintTicket = (booking) => {
    navigate('/agent/print-ticket', { state: booking });
  };

  const handleCreateBooking = () => {
    navigate('/agent/book');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agent dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Agent Header/Navigation */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-3xl text-primary mr-3">
                <i className="fas fa-bus"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Agent Dashboard</h1>
                {agent && (
                  <p className="text-sm text-gray-600">{agent.agencyName}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {agent && (
                <div className="text-right pr-4 border-r border-gray-300">
                  <p className="text-sm font-medium text-gray-900">{agent.ownerName}</p>
                  <p className="text-xs text-gray-500">Agent ID: {agent.agentId}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              className={`py-4 px-1 text-sm font-medium ${
                activeTab === 'bookings'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('bookings')}
            >
              <i className="fas fa-ticket-alt mr-2"></i>
              Bookings
            </button>
            <button
              className={`py-4 px-1 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fas fa-user mr-2"></i>
              Profile
            </button>
            <button
              className={`py-4 px-1 text-sm font-medium ${
                activeTab === 'reports'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('reports')}
            >
              <i className="fas fa-chart-bar mr-2"></i>
              Reports
            </button>
            <button
              className={`py-4 px-1 text-sm font-medium ${
                activeTab === 'help'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('help')}
            >
              <i className="fas fa-question-circle mr-2"></i>
              Help
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Booking Button */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {activeTab === 'bookings' && 'My Bookings'}
            {activeTab === 'profile' && 'Agent Profile'}
            {activeTab === 'reports' && 'Commission Reports'}
            {activeTab === 'help' && 'Help & Support'}
          </h2>
          {activeTab === 'bookings' && (
            <button
              onClick={handleCreateBooking}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition flex items-center"
            >
              <i className="fas fa-plus mr-2"></i>
              Create New Booking
            </button>
          )}
        </div>

        {/* Bookings Tab Content */}
        {activeTab === 'bookings' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl text-gray-300 mb-4">
                  <i className="fas fa-ticket-alt"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-500 mb-6">Start creating bookings for your customers</p>
                <button
                  onClick={handleCreateBooking}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
                >
                  Create Your First Booking
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Journey
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking._id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.passengers && booking.passengers.length > 0
                            ? booking.passengers[0].name
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.from || booking.source} → {booking.to || booking.destination}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{booking.fareInRupees}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handlePrintTicket(booking)}
                            className="text-primary hover:text-primary-dark mr-3"
                            title="Print Ticket"
                          >
                            <i className="fas fa-print"></i>
                          </button>
                          <button
                            className="text-gray-500 hover:text-gray-700"
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab Content */}
        {activeTab === 'profile' && agent && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="mb-6 flex flex-col md:flex-row items-start md:items-center">
                <div className="w-24 h-24 bg-gray-200 rounded-lg mr-6 flex items-center justify-center">
                  {agent.logo ? (
                    <img 
                      src={agent.logo} 
                      alt="Agency Logo" 
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/150?text=Agency";
                      }}
                    />
                  ) : (
                    <i className="fas fa-building text-4xl text-gray-400"></i>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{agent.agencyName}</h3>
                  <p className="text-sm text-gray-500">Agent ID: {agent.agentId}</p>
                  <p className="text-sm text-gray-500">
                    Status: <span className="text-green-600 font-medium">Active</span>
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Agency Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Owner Name</p>
                    <p className="font-medium">{agent.ownerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                    <p className="font-medium">{agent.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    <p className="font-medium">{agent.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Window Number</p>
                    <p className="font-medium">{agent.windowNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    <p className="font-medium">{agent.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Commission Rate</p>
                    <p className="font-medium">{agent.commissionRate}%</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Banking Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bank Name</p>
                    <p className="font-medium">{agent.bankName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Account Number</p>
                    <p className="font-medium">{agent.accountNumber.replace(/\d(?=\d{4})/g, "*")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">IFSC Code</p>
                    <p className="font-medium">{agent.ifscCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">PAN Number</p>
                    <p className="font-medium">{agent.panNumber}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab Content */}
        {activeTab === 'reports' && (
          <div className="bg-white shadow rounded-lg overflow-hidden p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Total Bookings</h4>
                <p className="text-2xl font-bold text-blue-900">{bookings.length}</p>
                <p className="text-xs text-blue-700 mt-2">All time</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h4 className="text-sm font-medium text-green-800 mb-1">Total Commission</h4>
                <p className="text-2xl font-bold text-green-900">
                  ₹{agent && agent.totalEarnings ? agent.totalEarnings.toFixed(2) : '0.00'}
                </p>
                <p className="text-xs text-green-700 mt-2">All time</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h4 className="text-sm font-medium text-purple-800 mb-1">Active Bookings</h4>
                <p className="text-2xl font-bold text-purple-900">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
                <p className="text-xs text-purple-700 mt-2">Currently active</p>
              </div>
            </div>

            <div className="text-center py-8">
              <div className="text-4xl text-gray-300 mb-4">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Detailed reports coming soon</h3>
              <p className="text-gray-500">
                We're working on comprehensive reports and analytics for agents.
              </p>
            </div>
          </div>
        )}

        {/* Help Tab Content */}
        {activeTab === 'help' && (
          <div className="bg-white shadow rounded-lg overflow-hidden p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <p className="font-medium text-gray-900 mb-2">How do I create a new booking?</p>
                  <p className="text-gray-600">
                    Click on the "Create New Booking" button from the Bookings tab, then follow the
                    step-by-step process to select a bus, seats, add passenger details and confirm payment.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="font-medium text-gray-900 mb-2">How is my commission calculated?</p>
                  <p className="text-gray-600">
                    Your commission is calculated at {agent?.commissionRate || 10}% of the ticket fare for each 
                    confirmed booking. Commissions are accumulated and paid out according to your agreement.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="font-medium text-gray-900 mb-2">How do I print or download a ticket?</p>
                  <p className="text-gray-600">
                    From the Bookings tab, find the booking you wish to print, click on the print icon,
                    then you'll be taken to a page where you can print or download the ticket as PDF.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Support</h3>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 border rounded-lg p-4">
                  <div className="text-2xl text-primary mb-3">
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Phone Support</h4>
                  <p className="text-gray-600 mb-2">Available 9am - 6pm, Monday to Saturday</p>
                  <p className="font-medium">1800-123-4567</p>
                </div>
                <div className="flex-1 border rounded-lg p-4">
                  <div className="text-2xl text-primary mb-3">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Email Support</h4>
                  <p className="text-gray-600 mb-2">We typically respond within 24 hours</p>
                  <p className="font-medium">agent.support@gungun.com</p>
                </div>
                <div className="flex-1 border rounded-lg p-4">
                  <div className="text-2xl text-primary mb-3">
                    <i className="fas fa-comment-dots"></i>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Live Chat</h4>
                  <p className="text-gray-600 mb-2">Available 9am - 8pm, all days</p>
                  <button className="text-primary font-medium">Start Chat</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AgentDashboard;
