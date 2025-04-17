import api from '../utils/axiosConfig';

export const getUserBookings = async () => {
  try {
    // Get user ID from localStorage using the new 'user' key
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Extract userId from the user object
    const userId = user.id || user._id;
    
    if (!userId) {
      console.error('User ID extraction failed from:', user);
      throw new Error('User ID not found. Please log in again.');
    }
    
    console.log('Using user ID for bookings:', userId);
    
    // Use the proper endpoint with userId parameter
    const response = await api.get(`/bookings/user/${userId}`);
    
    // Ensure we're returning an array even if the response structure varies
    console.log('Bookings API response:', response.data);
    
    let bookings = [];
    
    if (Array.isArray(response.data)) {
      bookings = response.data;
    } else if (response.data && Array.isArray(response.data.bookings)) {
      bookings = response.data.bookings;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      bookings = response.data.data;
    } else {
      console.warn('Booking data is not in expected format:', response.data);
      return [];
    }
    
    // Normalize and standardize bookings data
    return bookings.map(booking => {
      return {
        ...booking,
        // Convert any date formats to a consistent one
        date: booking.date || booking.journeyDate || booking.travelDate,
        // Make sure we have a status
        status: booking.status || 'pending',
        // Normalize fare/amount fields
        fareInRupees: booking.fareInRupees || booking.totalAmount || 0,
        totalAmount: booking.totalAmount || booking.fareInRupees || 0,
        // Make sure from/to are filled
        from: booking.from || (booking.bus && booking.bus.source) || '',
        to: booking.to || (booking.bus && booking.bus.destination) || '',
      };
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    const response = await api.patch(`/bookings/${bookingId}/status`, { status: 'cancelled' });
    return response.data;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};
