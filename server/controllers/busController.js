const Bus = require('../models/Bus');
const Booking = require('../models/Booking');

// Get all buses (admin only)
const getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find().sort({ createdAt: -1 });
    res.json(buses);
  } catch (error) {
    console.error('Error getting buses:', error);
    res.status(500).json({ message: 'Error getting buses', error: error.message });
  }
};

// Search buses by route, date, and type with advanced filtering
const searchBuses = async (req, res) => {
  try {
    console.log('Search Parameters:', req.query);

    // Build query with only isActive filter by default
    const query = { isActive: true };

    // Add source filter if provided
    if (req.query.source && req.query.source.trim()) {
      query.source = { $regex: new RegExp(req.query.source.trim(), 'i') };
    }

    // Add destination filter if provided
    if (req.query.destination && req.query.destination.trim()) {
      query.destination = { $regex: new RegExp(req.query.destination.trim(), 'i') };
    }

    // Add date filter if provided
    if (req.query.date) {
      const searchDate = new Date(req.query.date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);

      query.departureDate = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    console.log('Final Query:', JSON.stringify(query, null, 2));

    // Find buses matching the query
    const buses = await Bus.find(query).lean();
    console.log('Found Buses:', buses.length);

    // Enrich bus data with additional details
    const enrichedBuses = buses.map((bus) => {
      const now = new Date();
      const bookingOpenTime = new Date(bus.departureDate);
      const [openHours, openMinutes] = bus.bookingOpenTime.split(':').map(Number);
      bookingOpenTime.setHours(openHours, openMinutes);

      const bookingCloseTime = new Date(bus.departureDate);
      const [closeHours, closeMinutes] = bus.bookingCloseTime.split(':').map(Number);
      bookingCloseTime.setHours(closeHours, closeMinutes);

      const isBookingOpen = now >= bookingOpenTime && now <= bookingCloseTime;
      
      return {
        ...bus,
        availableSeats: bus.totalSeats - (bus.seats?.filter(s => s.isBooked)?.length || 0),
        bookingDetails: {
          bookingOpenTime: bus.bookingOpenTime,
          bookingCloseTime: bus.bookingCloseTime,
          bookingStatus: isBookingOpen ? 'Booking Open' : 'Booking Closed'
        }
      };
    });

    console.log('Enriched Buses:', JSON.stringify(enrichedBuses, null, 2));

    // Return found buses
    res.status(200).json({ 
      success: true, 
      data: enrichedBuses,
      message: `${enrichedBuses.length} buses found`
    });
  } catch (error) {
    console.error('Error in searchBuses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error while searching buses',
      error: error.message 
    });
  }
};

// Create new bus
const createBus = async (req, res) => {
  try {
    const {
      busNumber,
      source,
      destination,
      departureTime,
      arrivalTime,
      bookingOpenTime,
      bookingCloseTime,
      advanceBookingDays,
      totalSeats,
      seatArrangement,
      busType,
      fareInRupees,
      firstRowSeats,
      lastRowSeats,
      isActive
    } = req.body;

    // Check if bus number already exists
    const existingBus = await Bus.findOne({ busNumber });
    if (existingBus) {
      return res.status(400).json({ message: 'Bus number already exists' });
    }

    // Set departure date to today's date
    const departureDate = new Date();
    departureDate.setHours(0, 0, 0, 0);

    // Create new bus
    const bus = new Bus({
      busNumber,
      source,
      destination,
      departureTime,
      arrivalTime,
      departureDate,
      bookingOpenTime,
      bookingCloseTime,
      advanceBookingDays,
      totalSeats,
      seatArrangement,
      busType,
      fareInRupees,
      firstRowSeats,
      lastRowSeats,
      isActive: isActive !== undefined ? isActive : true
    });

    await bus.save();
    res.status(201).json(bus);
  } catch (error) {
    console.error('Error creating bus:', error);
    res.status(500).json({ message: 'Error creating bus', error: error.message });
  }
};

// Update bus
const updateBus = async (req, res) => {
  try {
    const {
      busNumber,
      source,
      destination,
      departureTime,
      arrivalTime,
      bookingOpenTime,
      bookingCloseTime,
      advanceBookingDays,
      totalSeats,
      seatArrangement,
      busType,
      fareInRupees,
      firstRowSeats,
      lastRowSeats,
      isActive
    } = req.body;

    const busId = req.params.id;

    // Check if bus exists
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    // Check if new bus number conflicts with existing bus (except itself)
    if (busNumber !== bus.busNumber) {
      const existingBus = await Bus.findOne({ busNumber });
      if (existingBus) {
        return res.status(400).json({ message: 'Bus number already exists' });
      }
    }

    // Set departure date to today's date
    const departureDate = new Date();
    departureDate.setHours(0, 0, 0, 0);

    // Update bus
    const updatedBus = await Bus.findByIdAndUpdate(
      busId,
      {
        busNumber,
        source,
        destination,
        departureTime,
        arrivalTime,
        departureDate,
        bookingOpenTime,
        bookingCloseTime,
        advanceBookingDays,
        totalSeats,
        seatArrangement,
        busType,
        fareInRupees,
        firstRowSeats,
        lastRowSeats,
        isActive
      },
      { new: true }
    );

    res.json(updatedBus);
  } catch (error) {
    console.error('Error updating bus:', error);
    res.status(500).json({ message: 'Error updating bus', error: error.message });
  }
};

// Delete bus
const deleteBus = async (req, res) => {
  try {
    const busId = req.params.id;

    // Check if bus exists
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    // Check if bus has any active bookings
    const activeBookings = await Booking.findOne({
      bus: busId,
      status: 'active'
    });

    if (activeBookings) {
      return res.status(400).json({ message: 'Cannot delete bus with active bookings' });
    }

    // Delete bus
    await Bus.findByIdAndDelete(busId);
    res.json({ message: 'Bus deleted successfully' });
  } catch (error) {
    console.error('Error deleting bus:', error);
    res.status(500).json({ message: 'Error deleting bus', error: error.message });
  }
};

module.exports = {
  getAllBuses,
  searchBuses,
  createBus,
  updateBus,
  deleteBus
};
