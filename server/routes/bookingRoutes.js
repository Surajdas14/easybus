const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const mongoose = require('mongoose');

// Create a new booking
router.post('/create', auth, async (req, res) => {
  try {
    const { 
      paymentMethod, 
      amount, 
      bookingDetails, 
      paymentDetails 
    } = req.body;

    // Validate input
    if (!bookingDetails || !bookingDetails.busId || !bookingDetails.seats) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid booking details' 
      });
    }

    // Find the bus
    const bus = await Bus.findById(bookingDetails.busId);
    if (!bus) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bus not found' 
      });
    }

    // Check seat availability
    const unavailableSeats = bookingDetails.seats.filter(seat => 
      bus.bookedSeats.includes(seat)
    );

    if (unavailableSeats.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Seats ${unavailableSeats.join(', ')} are already booked` 
      });
    }

    // Create booking
    const newBooking = new Booking({
      user: req.user._id,
      bus: bookingDetails.busId,
      seats: bookingDetails.seats,
      passengers: bookingDetails.passengers || [],
      totalAmount: amount,
      paymentMethod: paymentMethod,
      status: 'confirmed',
      paymentDetails: {
        method: paymentMethod,
        lastFourDigits: paymentDetails?.cardNumber?.slice(-4) || null
      }
    });

    // Save booking
    await newBooking.save();

    // Update bus booked seats
    bus.bookedSeats.push(...bookingDetails.seats);
    await bus.save();

    // Prepare response
    res.status(201).json({ 
      success: true, 
      message: 'Booking created successfully',
      bookingId: newBooking._id 
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating booking',
      error: error.message 
    });
  }
});

// Get user's bookings
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('bus', 'busNumber source destination departureTime')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: bookings.length, 
      bookings 
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching bookings' 
    });
  }
});

// Cancel a booking
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Remove booked seats from bus
    await Bus.findByIdAndUpdate(booking.bus, {
      $pull: { bookedSeats: { $in: booking.seats } }
    });

    res.json({ 
      success: true, 
      message: 'Booking cancelled successfully' 
    });
  } catch (error) {
    console.error('Booking cancellation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error cancelling booking' 
    });
  }
});

// Get booked seats for a specific bus and date
router.get('/bus/:busId/date/:date', auth, async (req, res) => {
  try {
    const { busId, date } = req.params;

    // Convert the date string to a Date object
    const bookingDate = new Date(date);

    // Find bookings for the specific bus and date
    const bookings = await Booking.find({
      bus: busId,
      // Use the date field directly
      date: {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(bookingDate.setHours(23, 59, 59, 999))
      },
      status: { $ne: 'cancelled' }
    });

    // Extract booked seats
    const bookedSeats = bookings.map(booking => booking.seatNumber);

    res.json({
      success: true,
      data: {
        bookedSeats,
        count: bookedSeats.length
      }
    });
  } catch (error) {
    console.error('Error fetching booked seats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booked seats',
      error: error.message
    });
  }
});

module.exports = router;
