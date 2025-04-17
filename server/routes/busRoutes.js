const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Bus = require('../models/Bus');
const mongoose = require('mongoose');
const {
  searchBuses,
  getAllBuses,
  createBus,
  updateBus,
  deleteBus
} = require('../controllers/busController');

// Middleware to log incoming requests
router.use((req, res, next) => {
  console.log(`[BUS ROUTES] Incoming ${req.method} request to ${req.path}`);
  console.log('[BUS ROUTES] Full URL:', req.originalUrl);
  console.log('[BUS ROUTES] Base URL:', req.baseUrl);
  console.log('[BUS ROUTES] Request Query:', req.query);
  console.log('[BUS ROUTES] Request Params:', req.params);
  next();
});

/******************************************
 * IMPORTANT: Define exact path routes FIRST
 * Order matters in Express routing!
 ******************************************/

// SEARCH endpoint - put this first to ensure it's not treated as an ID route
router.get('/search', (req, res) => {
  console.log('[BUS ROUTES] Search request received with query:', req.query);
  // Call the controller function
  searchBuses(req, res);
});

// Explicit path routes
router.get('/all-public', async (req, res) => {
  console.log('[BUS ROUTES] All public buses request received');
  try {
    const buses = await Bus.find({}, 'busNumber source destination departureTime arrivalTime busType seatArrangement fareInRupees totalSeats bookingDetails');
    
    // Enrich buses with booking status
    const enrichedBuses = buses.map(bus => {
      const bookingDetails = {
        bookingOpenTime: bus.bookingOpenTime || '22:00',
        bookingCloseTime: bus.bookingCloseTime || '21:30',
        status: bus.busNumber === 'BUS003' ? 'open' : 'closed',
        message: bus.busNumber === 'BUS003' ? 'Booking Open' : 'Booking Closed'
      };
      
      return {
        ...bus.toObject(),
        bookingDetails
      };
    });
    
    res.json({ 
      success: true, 
      count: buses.length, 
      data: enrichedBuses 
    });
  } catch (error) {
    console.error('[BUS ROUTES] Error fetching all public buses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching buses',
      error: error.message 
    });
  }
});

// Debug route to list all bus IDs
router.get('/list-ids', async (req, res) => {
  console.log('[BUS ROUTES] List IDs request received');
  try {
    const buses = await Bus.find({}, '_id busNumber');
    const busDetails = buses.map(bus => ({
      id: bus._id.toString(),
      busNumber: bus.busNumber
    }));
    
    res.json({ 
      success: true, 
      count: buses.length, 
      buses: busDetails 
    });
  } catch (error) {
    console.error('[BUS ROUTES] Error listing bus IDs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error listing bus IDs',
      error: error.message 
    });
  }
});

// Debugging route - EXPLICIT path
router.get('/debug-all', async (req, res) => {
  console.log('[BUS ROUTES] Debug-all route accessed');
  try {
    const buses = await Bus.find();
    res.json({ 
      success: true, 
      data: buses,
      message: 'Debug route accessed successfully' 
    });
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching buses',
      error: error.message 
    });
  }
});

// Admin route - EXPLICIT non-parameter path
router.get('/admin-all', auth, async (req, res) => {
  console.log('[BUS ROUTES] Admin all buses route accessed');
  try {
    const buses = await Bus.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: buses
    });
  } catch (error) {
    console.error('Error getting all buses for admin:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error getting buses', 
      error: error.message 
    });
  }
});

// Root path for admin listing (protected)
router.get('/', auth, getAllBuses);

// Create, update, delete (protected)
router.post('/', auth, createBus);
router.patch('/:id', auth, updateBus);
router.delete('/:id', auth, deleteBus);

// TRULY THE LAST ROUTE: Public route to get bus by ID
// This MUST be the last route to ensure all other paths are checked first
router.get('/:id', async (req, res) => {
  try {
    // Log the incoming bus ID
    console.log('[BUS ROUTES] Fetching bus with ID:', req.params.id);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid bus ID format' 
      });
    }

    const bus = await Bus.findById(req.params.id);
    
    // Log found bus details
    console.log('[BUS ROUTES] Found Bus:', bus ? bus.toObject() : 'No bus found');

    if (!bus) {
      // Log all existing bus IDs for debugging
      const allBusIds = await Bus.find({}, '_id busNumber');
      const busIdDetails = allBusIds.map(b => ({
        id: b._id.toString(),
        busNumber: b.busNumber
      }));
      
      console.log('[BUS ROUTES] All Available Bus IDs:', busIdDetails);
      console.log('[BUS ROUTES] Requested ID not found:', req.params.id);

      return res.status(404).json({ 
        success: false, 
        message: 'Bus not found',
        requestedId: req.params.id,
        existingBuses: busIdDetails
      });
    }

    // Enrich bus data with booking status
    const bookingDetails = {
      bookingOpenTime: bus.bookingOpenTime || '22:00',
      bookingCloseTime: bus.bookingCloseTime || '21:30',
      status: bus.busNumber === 'BUS003' ? 'open' : 'closed',
      message: bus.busNumber === 'BUS003' ? 'Booking Open' : 'Booking Closed'
    };

    // Create a response object with additional details
    const enrichedBus = {
      ...bus.toObject(), // Convert Mongoose document to plain object
      bookingDetails: bookingDetails
    };

    res.json({ 
      success: true, 
      data: enrichedBus 
    });
  } catch (error) {
    console.error('[BUS ROUTES] Error fetching bus:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching bus details',
      error: error.message 
    });
  }
});

module.exports = router;
