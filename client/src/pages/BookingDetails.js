import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [busDetails, setBusDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchBookingDetails = async () => {
      try {
        const response = await api.get(`/api/bookings/${id}`);
        setBooking(response.data);
        
        // Fetch the latest bus details
        if (response.data.busId) {
          const busResponse = await api.get(`/api/buses/${response.data.busId}`);
          setBusDetails(busResponse.data);
        }
      } catch (error) {
        setError('Failed to fetch booking details. Please try again later.');
        console.error('Error fetching booking details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id, navigate]);

  const handleCancelBooking = async () => {
    try {
      await api.patch(`/api/bookings/${id}/status`, { status: 'cancelled' });
      setBooking(prev => ({ ...prev, status: 'cancelled' }));
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {error || 'Booking not found'}
          </h2>
          <p className="text-gray-600 mb-4">
            We couldn't find the booking you're looking for.
          </p>
          <button
            onClick={() => navigate('/my-bookings')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">Booking Details</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Booking Information */}
          <div className="px-6 py-4">
            {/* Journey Details */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Journey Details</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">From</div>
                    <div className="text-lg font-medium text-gray-900">{booking.from}</div>
                  </div>
                  <div className="px-4">
                    <i className="fas fa-arrow-right text-gray-400"></i>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-sm text-gray-500">To</div>
                    <div className="text-lg font-medium text-gray-900">{booking.to}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Date</div>
                    <div className="text-gray-900">{new Date(booking.date).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Time</div>
                    <div className="text-gray-900">{booking.time}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Seat Number</div>
                    <div className="text-gray-900">{booking.seatNumber}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Details */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Price Details</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Base Fare</span>
                  <span className="text-gray-900">₹{booking.price}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">₹{Math.round(booking.price * 0.05)}</span>
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total Amount</span>
                    <span className="font-medium text-gray-900">₹{Math.round(booking.price * 1.05)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bus Details with Latest Information */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Bus Details</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Bus Number</div>
                    <div className="text-gray-900">{busDetails?.busNumber || booking.busNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Bus Type</div>
                    <div className="text-gray-900">{busDetails?.busType || booking.busType || 'AC Sleeper'}</div>
                  </div>
                  {busDetails && (
                    <>
                      <div>
                        <div className="text-sm text-gray-500">Source</div>
                        <div className="text-gray-900">{busDetails.source}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Destination</div>
                        <div className="text-gray-900">{busDetails.destination}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate('/my-bookings')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to My Bookings
              </button>
              {booking.status === 'active' && (
                <button
                  onClick={handleCancelBooking}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <i className="fas fa-times mr-2"></i>
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
