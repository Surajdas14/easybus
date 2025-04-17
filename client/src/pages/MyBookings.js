import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Get user data from localStorage
        const userDataStr = localStorage.getItem('userData');
        if (!userDataStr) {
          navigate('/login');
          return;
        }

        const userData = JSON.parse(userDataStr);
        if (!userData || !userData._id) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`/api/bookings/user/${userData._id}`);
        if (response.data.success) {
          setBookings(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          toast.error('Failed to fetch bookings');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await axios.patch(`/api/bookings/${bookingId}/status`, {
        status: 'cancelled'
      });
      
      if (response.data.success) {
        toast.success('Booking cancelled successfully');
        // Update the booking status in the local state
        setBookings(bookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: 'cancelled' }
            : booking
        ));
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">My Bookings</h2>
          {bookings.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No bookings found. <a href="/book" className="text-primary hover:text-primary-dark">Book a ticket now!</a>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div key={booking._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {booking.bus.source} to {booking.bus.destination}
                      </h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          Bus Number: {booking.bus.busNumber} ({booking.bus.busType})
                        </p>
                        <p className="text-sm text-gray-600">
                          Travel Date: {new Date(booking.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Departure: {booking.bus.departureTime} | Arrival: {booking.bus.arrivalTime}
                        </p>
                        <p className="text-sm text-gray-600">
                          Seats: {booking.seats.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      <p className="text-lg font-medium text-gray-900">
                        ₹{booking.totalAmount}
                      </p>
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
