const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Bus = require('../models/Bus');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Get today's date at midnight
const today = new Date();
today.setHours(0, 0, 0, 0);

// Sample bus data
const sampleBuses = [
  {
    busNumber: 'BUS001',
    source: 'Mumbai',
    destination: 'Pune',
    departureTime: '10:00',
    arrivalTime: '13:00',
    departureDate: today,
    bookingOpenTime: '00:00',
    bookingCloseTime: '23:59',
    advanceBookingDays: 30,
    totalSeats: 40,
    seatArrangement: '2-2',
    busType: 'AC',
    fareInRupees: 800,
    firstRowSeats: 2,
    lastRowSeats: 3,
    isActive: true
  },
  {
    busNumber: 'BUS002',
    source: 'Delhi',
    destination: 'Jaipur',
    departureTime: '09:00',
    arrivalTime: '15:00',
    departureDate: today,
    bookingOpenTime: '00:00',
    bookingCloseTime: '23:59',
    advanceBookingDays: 30,
    totalSeats: 35,
    seatArrangement: '2-2',
    busType: 'Non-AC',
    fareInRupees: 600,
    firstRowSeats: 2,
    lastRowSeats: 3,
    isActive: true
  },
  {
    busNumber: 'BUS003',
    source: 'Bangalore',
    destination: 'Chennai',
    departureTime: '20:00',
    arrivalTime: '06:00',
    departureDate: today,
    bookingOpenTime: '00:00',
    bookingCloseTime: '23:59',
    advanceBookingDays: 30,
    totalSeats: 45,
    seatArrangement: '2-2',
    busType: 'Deluxe',
    fareInRupees: 1200,
    firstRowSeats: 2,
    lastRowSeats: 3,
    isActive: true
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected successfully');
  
  try {
    // Delete all existing buses
    await Bus.deleteMany({});
    console.log('Cleared existing buses');

    // Add sample buses
    const result = await Bus.insertMany(sampleBuses);
    console.log('Added sample buses:', result);
  } catch (error) {
    console.error('Error adding sample buses:', error);
  }
  
  // Close the connection
  mongoose.connection.close();
})
.catch((err) => console.error('MongoDB connection error:', err));
