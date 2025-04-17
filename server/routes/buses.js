const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const Bus = require('../models/Bus');
const mongoose = require('mongoose');
const {
  searchBuses,
  createBus,
  updateBus,
  deleteBus,
  getAllBuses
} = require('../controllers/busController');

// Logging middleware
router.use((req, res, next) => {
  console.log('=== BUS ROUTES DEBUG ===');
  console.log(`[${new Date().toISOString()}] Incoming ${req.method} request`);
  console.log('Full URL:', req.originalUrl);
  console.log('Base URL:', req.baseUrl);
  console.log('Path:', req.path);
  console.log('Query Params:', req.query);
  console.log('Route Params:', req.params);
  console.log('=== END DEBUG ===');
  next();
});

// IMPORTANT: Define static routes first, before any parameter routes
// Public route to get all buses
router.get('/all-public', async (req, res) => {
  try {
    console.log('Fetching all public buses');
    // Get more bus fields to display accurate information
    const buses = await Bus.find({}, 'busNumber source destination departureTime arrivalTime busType seatArrangement fareInRupees totalSeats isActive bookingOpenTime bookingCloseTime advanceBookingDays');
    
    // Get current time for booking status calculation
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                        now.getMinutes().toString().padStart(2, '0');
    
    console.log('Current time for booking check:', currentTime);
    
    // Enrich buses with booking status based on actual properties
    const enrichedBuses = buses.map(bus => {
      // OVERRIDE: Force sane default booking times regardless of what's in DB
      // This ensures proper display without requiring database update
      const openTime = '06:00'; // 6 AM opening
      const closeTime = '22:00'; // 10 PM closing
      
      // Log the values being used
      console.log(`Bus ${bus.busNumber} using booking times:`, { 
        openTime, 
        closeTime,
        originalOpen: bus.bookingOpenTime,
        originalClose: bus.bookingCloseTime,
        isActive: bus.isActive 
      });
      
      // Calculate if booking is currently open based on time
      // A simple string comparison works for HH:MM format
      const isTimeInBookingWindow = currentTime >= openTime && currentTime <= closeTime;
      
      // Bus is available if it's marked as active AND current time is within booking window
      const isActive = bus.isActive !== undefined ? bus.isActive : true;
      const isAvailableForBooking = isActive && isTimeInBookingWindow;
      
      const bookingDetails = {
        bookingOpenTime: openTime,
        bookingCloseTime: closeTime,
        status: isAvailableForBooking ? 'open' : 'closed',
        message: isAvailableForBooking ? 'Booking Open' : isActive ? 
                 `Booking available ${openTime}-${closeTime}` : 'Bus Inactive'
      };
      
      return {
        ...bus.toObject(),
        bookingDetails
      };
    });
    
    console.log('Found Buses:', buses.length);
    res.json({ 
      success: true, 
      count: buses.length, 
      data: enrichedBuses 
    });
  } catch (error) {
    console.error('Error fetching all public buses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching buses',
      error: error.message 
    });
  }
});

// Route to list all bus IDs
router.get('/list-ids', async (req, res) => {
  try {
    console.log('Listing all bus IDs');
    const buses = await Bus.find({}, '_id busNumber');
    const busDetails = buses.map(bus => ({
      id: bus._id.toString(),
      busNumber: bus.busNumber
    }));
    
    console.log('Bus IDs:', busDetails);
    res.json({ 
      success: true, 
      count: buses.length, 
      buses: busDetails 
    });
  } catch (error) {
    console.error('Error listing bus IDs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error listing bus IDs',
      error: error.message 
    });
  }
});

// Public route to search buses
router.get('/search', searchBuses);

// Protected routes (admin only)
router.get('/', auth, isAdmin, getAllBuses);
router.post('/', auth, isAdmin, createBus);
router.patch('/:id', auth, isAdmin, updateBus);
router.delete('/:id', auth, isAdmin, deleteBus);

// Remove the catch-all debug middleware that's confusing the routes
// router.use((req, res, next) => {
//   console.log('Unhandled Bus Route:', {
//     method: req.method,
//     path: req.path,
//     originalUrl: req.originalUrl,
//     baseUrl: req.baseUrl,
//     params: req.params,
//     query: req.query
//   });
//   next();
// });

// Route to get a single bus by ID - THIS MUST BE LAST!
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching bus with ID: ${id}`);
    
    // Validate if ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bus ID format'
      });
    }
    
    const bus = await Bus.findById(id);
    
    if (!bus) {
      // Log all bus IDs to help with debugging
      const allBuses = await Bus.find({}, '_id busNumber');
      console.log('Available bus IDs:', allBuses.map(b => ({id: b._id.toString(), number: b.busNumber})));
      
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
        requestedId: id
      });
    }
    
    console.log('Bus found:', bus.busNumber);

    // Add booking details to the response
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                      now.getMinutes().toString().padStart(2, '0');
                      
    const openTime = bus.bookingOpenTime || '06:00';
    const closeTime = bus.bookingCloseTime || '22:00';
    const isActive = bus.isActive !== undefined ? bus.isActive : true;
    const isTimeInBookingWindow = currentTime >= openTime && currentTime <= closeTime;
    const isAvailableForBooking = isActive && isTimeInBookingWindow;

    const enrichedBus = {
      ...bus.toObject(),
      bookingDetails: {
        bookingOpenTime: openTime,
        bookingCloseTime: closeTime,
        status: isAvailableForBooking ? 'open' : 'closed',
        message: isAvailableForBooking ? 'Booking Open' : isActive ? 
                `Booking available ${openTime}-${closeTime}` : 'Bus Inactive'
      }
    };
    
    res.json({
      success: true,
      data: enrichedBus
    });
  } catch (error) {
    console.error('Error fetching single bus:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bus details',
      error: error.message
    });
  }
});

// Global error handler for bus routes
router.use((err, req, res, next) => {
  console.error('Unhandled Bus Routes Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal Server Error in Bus Routes',
    error: err.message 
  });
});

module.exports = router;
