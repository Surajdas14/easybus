const Booking = require('../models/Booking');
const Bus = require('../models/Bus');

// Get booking statistics
const getBookingStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$fareInRupees' } } }
    ]);

    res.json({
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      success: true
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({ 
      message: 'Server error', 
      success: false,
      totalBookings: 0,
      totalRevenue: 0
    });
  }
};

// Get recent bookings
const getRecentBookings = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name phone')
      .populate('bus', 'busNumber busType source destination');

    res.json({
      bookings: bookings,
      total: bookings.length,
      success: true
    });
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    res.status(500).json({ 
      message: 'Server error', 
      success: false,
      bookings: []
    });
  }
};

// Get all bookings (admin only)
const getAllBookings = async (req, res) => {
  try {
    // Only allow admin to access all bookings
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const bookings = await Booking.find()
      .populate('bus', 'busNumber busType')
      .populate('user', 'name phone');
    res.json({
      bookings: bookings,
      total: bookings.length,
      success: true
    });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ 
      message: 'Server error', 
      success: false,
      bookings: []
    });
  }
};

// Get user bookings
const getUserBookings = async (req, res) => {
  try {
    console.log('Fetching bookings for user:', req.params.userId);
    console.log('Current user:', req.user);
    
    // Convert IDs to strings for reliable comparison
    const requestedUserId = req.params.userId;
    const currentUserId = req.user.id ? req.user.id.toString() : '';
    
    // Only allow users to access their own bookings
    if (currentUserId !== requestedUserId && req.user.role !== 'admin') {
      console.log('Access denied: User tried to access another user\'s bookings');
      return res.status(403).json({ 
        message: 'Access denied. You can only view your own bookings.', 
        success: false 
      });
    }

    // Calculate date 6 months ago from today
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Find bookings for this user that are newer than 6 months
    const bookings = await Booking.find({
      user: requestedUserId,
      createdAt: { $gte: sixMonthsAgo }
    })
      .populate('bus', 'busNumber name busType source destination departureTime arrivalTime')
      .sort({ createdAt: -1 });

    console.log(`Found ${bookings.length} bookings for user ${requestedUserId}`);

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ 
      message: 'Server error when fetching bookings', 
      success: false
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('bus', 'busNumber busType source destination')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ 
        message: 'Booking not found', 
        success: false,
        booking: null
      });
    }

    // Only allow users to access their own bookings
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      booking: booking,
      success: true
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ 
      message: 'Server error', 
      success: false,
      booking: null
    });
  }
};

// Create new booking
const createBooking = async (req, res) => {
  try {
    const { 
      busId, 
      seats, 
      from, 
      to, 
      date, 
      departureTime, 
      arrivalTime,
      passengers = [], 
      fareInRupees: clientFare 
    } = req.body;

    // Validate if seats are empty array
    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one seat'
      });
    }

    // Find the bus
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Check if any of the seats are already booked
    const existingBookings = await Booking.find({
      bus: busId,
      date: date,
      status: { $in: ['confirmed', 'pending'] },
      seats: { $in: seats }
    });

    if (existingBookings.length > 0) {
      // Get the list of already booked seats
      const alreadyBookedSeats = [];
      existingBookings.forEach(booking => {
        booking.seats.forEach(seat => {
          if (seats.includes(seat)) {
            alreadyBookedSeats.push(seat);
          }
        });
      });

      return res.status(400).json({
        success: false,
        message: `Seats ${alreadyBookedSeats.join(', ')} are already booked. Please select different seats.`,
        alreadyBookedSeats
      });
    }

    // Calculate fare based on the bus's fareInRupees property
    if (!bus.fareInRupees) {
      return res.status(400).json({ 
        message: 'Invalid fare information for this bus', 
        success: false,
        booking: null
      });
    }

    const fareInRupees = clientFare || (bus.fareInRupees * seats.length);
    
    // Create a standardized passenger list if not provided
    let bookingPassengers = passengers;
    if (!bookingPassengers || !Array.isArray(bookingPassengers) || bookingPassengers.length === 0) {
      bookingPassengers = seats.map((seat, index) => ({
        seat,
        name: `Passenger ${index + 1}`,
        age: '35',
        gender: 'Not specified',
        phone: '',
        email: ''
      }));
    }

    const booking = new Booking({
      user: req.user.id,
      bus: busId,
      seats,
      passengers: bookingPassengers,
      from,
      to,
      date,
      departureTime: departureTime || bus.departureTime || '',
      arrivalTime: arrivalTime || bus.arrivalTime || '',
      fareInRupees,
      status: 'pending'
    });

    await booking.save();

    // Populate bus and user details before sending response
    await booking.populate([
      { path: 'bus', select: 'busNumber busType source destination departureTime arrivalTime' },
      { path: 'user', select: 'name phone email' }
    ]);

    res.status(201).json({
      booking: booking,
      success: true
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ 
      message: 'Server error', 
      success: false,
      booking: null
    });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ 
        message: 'Booking not found', 
        success: false,
        booking: null
      });
    }

    // Only allow admin or the user who made the booking to update booking status
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow valid status updates
    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status', 
        success: false,
        booking: null
      });
    }

    // Only allow users to update their own booking status to 'confirmed' after payment
    if (req.user.role !== 'admin' && status === 'confirmed' && booking.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Cannot confirm this booking', 
        success: false,
        booking: null
      });
    }

    booking.status = status;
    await booking.save();

    // Populate bus and user details before sending response
    await booking.populate([
      { path: 'bus', select: 'busNumber busType source destination' },
      { path: 'user', select: 'name phone' }
    ]);

    res.json({
      booking: booking,
      success: true
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ 
      message: 'Server error', 
      success: false,
      booking: null
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ 
        message: 'Booking not found', 
        success: false,
        booking: null
      });
    }

    // Only allow users to cancel their own bookings or admin to cancel any booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow cancellation of pending or confirmed bookings
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ 
        message: 'Cannot cancel this booking', 
        success: false,
        booking: null
      });
    }
    
    // Check if the journey date and time are more than 2 hours in the future
    const journeyDateTime = new Date(booking.date);
    
    // If we have a specific time from the bus, use it
    await booking.populate('bus');
    if (booking.bus && booking.bus.departureTime) {
      const [hours, minutes] = booking.bus.departureTime.split(':').map(Number);
      journeyDateTime.setHours(hours, minutes);
    } else {
      // Default to midnight if no specific time
      journeyDateTime.setHours(0, 0, 0, 0);
    }
    
    const currentTime = new Date();
    const timeUntilJourney = journeyDateTime.getTime() - currentTime.getTime();
    const twoHoursInMillis = 2 * 60 * 60 * 1000;
    
    if (timeUntilJourney < twoHoursInMillis) {
      return res.status(400).json({
        message: 'Cancellation is only allowed up to 2 hours before journey time',
        success: false,
        booking: null
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Populate bus and user details before sending response
    await booking.populate([
      { path: 'bus', select: 'busNumber busType source destination' },
      { path: 'user', select: 'name phone' }
    ]);

    res.json({
      booking: booking,
      success: true
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ 
      message: 'Server error', 
      success: false,
      booking: null
    });
  }
};

module.exports = {
  getAllBookings,
  getUserBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  getBookingStats,
  getRecentBookings
};
