const mongoose = require('mongoose');
const Booking = require('../models/Booking');
require('dotenv').config();

// Get MongoDB URI from environment variables
const mongoURI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected for cleanup...'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function clearAllBookings() {
  try {
    // Delete all bookings
    const result = await Booking.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} bookings from database`);
    
    // Reset seat bookings in Bus model
    const Bus = require('../models/Bus');
    const buses = await Bus.find({});
    
    for (const bus of buses) {
      // Reset all seats to available
      if (bus.seats && Array.isArray(bus.seats)) {
        bus.seats.forEach(seat => {
          if (seat) {
            seat.isBooked = false;
            seat.bookingId = null;
          }
        });
        await bus.save();
      }
    }
    
    console.log('Reset seat availability for all buses');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    console.log('✅ All bookings have been removed from the database');
  } catch (error) {
    console.error('Error clearing bookings:', error);
  }
}

// Execute the cleanup
clearAllBookings();
