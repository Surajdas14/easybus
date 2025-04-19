import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUserBookings, cancelBooking } from '../services/bookingService';
import { getCurrentUser } from '../utils/authUtils';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Check if user is admin and redirect if necessary
    if (currentUser.role === 'admin') {
      console.log('Admin user detected - redirecting to admin dashboard');
      navigate('/admin/dashboard');
      return;
    }

    // Check if user is agent and redirect if necessary
    if (currentUser.role === 'agent') {
      console.log('Agent user detected - redirecting to agent dashboard');
      navigate('/agent/dashboard');
      return;
    }
    
    // Only set user state if not admin/agent (they will be redirected)
    setUser(currentUser);

    const fetchBookings = async () => {
      try {
        const bookingsData = await getUserBookings();
        console.log('Fetched bookings data:', bookingsData);
        
        // Ensure bookings is always an array
        if (Array.isArray(bookingsData)) {
          setBookings(bookingsData);
        } else {
          console.warn('Unexpected bookings data format:', bookingsData);
          setBookings([]);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to fetch bookings. Please try again later.');
        // Ensure bookings is an empty array when there's an error
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const handleCancelBooking = async (bookingId, travelDate, departureTime) => {
    try {
      // Check if cancellation is allowed based on travel time
      const journeyDateTime = new Date(travelDate);
      
      // If we have departure time, use it
      if (departureTime) {
        const [hours, minutes] = departureTime.split(':').map(Number);
        journeyDateTime.setHours(hours, minutes);
      }
      
      const currentTime = new Date();
      const timeUntilJourney = journeyDateTime.getTime() - currentTime.getTime();
      const twoHoursInMillis = 2 * 60 * 60 * 1000;
      
      if (timeUntilJourney < twoHoursInMillis) {
        toast.error('Cancellation is only allowed up to 2 hours before journey time');
        return;
      }
      
      const confirmCancel = window.confirm(
        'Are you sure you want to cancel this booking?\nCancellation is only allowed up to 2 hours before journey time.'
      );
      if (!confirmCancel) return;

      await cancelBooking(bookingId);
      
      // Update local state to remove cancelled booking
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: 'cancelled' } 
            : booking
        )
      );

      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || 'Failed to cancel booking. Please try again.');
    }
  };

  const handlePrintTicket = (booking) => {
    // Format the data to match what the PrintTicket component expects
    const ticketData = {
      busId: booking.bus?._id || booking.busId,
      busNumber: booking.bus?.busNumber || booking.busNumber || 'Unknown',
      source: booking.from || booking.bus?.source || 'Unknown',
      destination: booking.to || booking.bus?.destination || 'Unknown',
      departureTime: booking.bus?.departureTime || booking.departureTime || booking.time || '',
      arrivalTime: booking.bus?.arrivalTime || booking.arrivalTime || '',
      travelDate: booking.date || booking.journeyDate || new Date().toISOString(),
      selectedSeats: Array.isArray(booking.seats) ? booking.seats : [booking.seats].filter(Boolean),
      totalAmount: booking.fareInRupees || booking.totalAmount || 0,
      bookingId: booking._id,
      paymentMethod: booking.paymentMethod || 'Online Payment',
      paymentStatus: booking.status === 'pending' ? 'completed' : booking.status,
      bookingTime: booking.createdAt || new Date().toISOString(),
      // Use actual passenger data if available, otherwise generate it
      passengers: booking.passengers && Array.isArray(booking.passengers) && booking.passengers.length > 0 
        ? booking.passengers 
        : Array.isArray(booking.seats) 
          ? booking.seats.map((seat, index) => ({
              seat: seat,
              name: `Passenger ${index + 1}`,
              age: booking.passengerAge || '35',
              gender: booking.passengerGender || 'Not specified'
            })) 
          : []
    };
    
    console.log('Sending ticket data:', ticketData);
    
    navigate('/print-ticket', { 
      state: ticketData,
      fromDashboard: true 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.name || 'User'}
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/book')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Book New Ticket
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Bookings</h2>

      {!Array.isArray(bookings) || bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🎫</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-500 mb-6">Start your journey by booking a bus ticket</p>
          <button
            onClick={() => navigate('/book')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Book Now
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🚌</span>
                  <h3 className="text-lg font-medium text-gray-900">
                    {booking.bus?.name || booking.bus?.busNumber || 'Unknown Bus'}
                  </h3>
                </div>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  booking.status === 'confirmed'
                    ? 'bg-green-100 text-green-800'
                    : booking.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status === 'pending' ? 'Booked' : 
                   booking.status ? (booking.status.charAt(0).toUpperCase() + booking.status.slice(1)) : 'Unknown'}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-500">
                <p>
                  <span className="font-medium">Booking ID:</span> {booking._id.substring(0, 8).toUpperCase()}
                </p>
                <p>
                  <span className="font-medium">From:</span> {booking.from || booking.bus?.source || 'Unknown'}
                </p>
                <p>
                  <span className="font-medium">To:</span> {booking.to || booking.bus?.destination || 'Unknown'}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{' '}
                  {booking.date ? new Date(booking.date).toLocaleDateString() : 
                   (booking.journeyDate ? new Date(booking.journeyDate).toLocaleDateString() : 'Unknown')}
                </p>
                <p>
                  <span className="font-medium">Seats:</span>{' '}
                  {Array.isArray(booking.seats) ? booking.seats.join(', ') : 'Unknown'}
                </p>
                <p>
                  <span className="font-medium">Total Amount:</span> ₹
                  {booking.fareInRupees || booking.totalAmount || 0}
                </p>
                
                {/* QR Code for ticket verification */}
                <div className="flex justify-center mt-3 mb-1">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=GUNGUN-${booking._id}`}
                    alt="Ticket QR Code" 
                    className="w-20 h-20 border border-gray-200 rounded"
                  />
                </div>
                <p className="text-xs text-center text-gray-400">Scan for verification</p>
              </div>
              <div className="flex space-x-2 mt-4">
                {booking.status !== 'cancelled' && (
                  <>
                    <button
                      onClick={() => handlePrintTicket(booking)}
                      className="flex-1 px-4 py-2 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <span className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Ticket
                      </span>
                    </button>
                    {booking.status !== 'confirmed' && (
                      <button
                        onClick={() => handleCancelBooking(
                          booking._id, 
                          booking.date || booking.journeyDate || booking.travelDate, 
                          booking.bus?.departureTime || booking.departureTime || booking.time
                        )}
                        className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
