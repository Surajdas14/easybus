const express = require('express');
const router = express.Router();
const { auth, isAdmin, isAgent } = require('../middleware/auth');
const Booking = require('../models/Booking');
const {
  getAllBookings,
  getUserBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  getBookingStats,
  getRecentBookings
} = require('../controllers/bookingController');

// Request logging middleware
router.use((req, res, next) => {
  console.log(`[BOOKING ROUTES] ${req.method} ${req.path}`);
  console.log(`[BOOKING ROUTES] Query:`, req.query);
  console.log(`[BOOKING ROUTES] Params:`, req.params);
  next();
});

// Get booking statistics (admin only)
router.get('/stats', auth, isAdmin, getBookingStats);

// Get recent bookings (admin only)
router.get('/recent', auth, isAdmin, getRecentBookings);

// Get agent's bookings
router.get('/agent', auth, isAgent, async (req, res) => {
  try {
    console.log(`[BOOKING ROUTES] Fetching bookings for agent: ${req.user.id}`);
    
    // Find all bookings where the agent is the one who made the booking
    const bookings = await Booking.find({ agent: req.user.id })
      .populate('bus')
      .populate('user')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error(`[BOOKING ROUTES] Error fetching agent bookings:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent bookings',
      error: error.message
    });
  }
});

// Get booked seats for a bus on a specific date
router.get('/bus/:busId/date/:date', async (req, res) => {
  try {
    const { busId, date } = req.params;
    console.log(`[BOOKING ROUTES] Fetching booked seats for bus ${busId} on date ${date}`);
    
    // Find all confirmed bookings for this bus and date
    const bookings = await Booking.find({
      bus: busId,
      date: date,
      status: { $in: ['confirmed', 'pending'] }
    });
    
    console.log(`[BOOKING ROUTES] Found ${bookings.length} bookings for this bus and date`);
    
    // Extract booked seat numbers
    const bookedSeats = bookings.reduce((seats, booking) => {
      // Support both seats and seatNumbers fields for backward compatibility
      const bookingSeats = booking.seats || booking.seatNumbers || [];
      console.log(`[BOOKING ROUTES] Booking ${booking._id} has seats:`, bookingSeats);
      return [...seats, ...bookingSeats];
    }, []);
    
    console.log(`[BOOKING ROUTES] Found ${bookedSeats.length} booked seats:`, bookedSeats);
    
    res.json({
      success: true,
      busId,
      travelDate: date,
      bookedSeats,
      totalBookedSeats: bookedSeats.length
    });
  } catch (error) {
    console.error(`[BOOKING ROUTES] Error fetching booked seats:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booked seats',
      error: error.message
    });
  }
});

// Get all bookings (admin only)
router.get('/', auth, isAdmin, getAllBookings);

// Get user's bookings
router.get('/user/:userId', auth, getUserBookings);

// Get booking by ID
router.get('/:id', auth, getBookingById);

// Create new booking
router.post('/', auth, createBooking);

// Update booking status
router.patch('/:id/status', auth, updateBookingStatus);

// Cancel booking
router.delete('/:id', auth, cancelBooking);

module.exports = router;
