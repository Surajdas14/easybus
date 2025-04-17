const mongoose = require('mongoose');
const Bus = require('../models/Bus');

const MONGODB_URI = 'mongodb+srv://Surajdas14:Namrup.8486915664@cluster0.jqsjk.mongodb.net/easybus?retryWrites=true&w=majority';

const sampleBuses = [
  {
    busNumber: 'BUS001',
    busType: 'AC',
    source: 'Mumbai',
    destination: 'Pune',
    departureDate: new Date('2025-04-01T08:00:00'),
    departureTime: '08:00',
    arrivalTime: '10:30',
    fareInRupees: 500,
    totalSeats: 40,
    availableSeats: 40,
    bookingOpenDateTime: new Date(new Date('2025-04-01T08:00:00').setHours(new Date('2025-04-01T08:00:00').getHours() - 24)),
    bookingCloseDateTime: new Date(new Date('2025-04-01T08:00:00').setHours(new Date('2025-04-01T08:00:00').getHours() - 1)),
    isActive: true
  },
  {
    busNumber: 'BUS002',
    busType: 'Non-AC',
    source: 'Delhi',
    destination: 'Jaipur',
    departureDate: new Date('2025-04-01T09:15:00'),
    departureTime: '09:15',
    arrivalTime: '12:45',
    fareInRupees: 350,
    totalSeats: 50,
    availableSeats: 50,
    bookingOpenDateTime: new Date(new Date('2025-04-01T09:15:00').setHours(new Date('2025-04-01T09:15:00').getHours() - 24)),
    bookingCloseDateTime: new Date(new Date('2025-04-01T09:15:00').setHours(new Date('2025-04-01T09:15:00').getHours() - 1)),
    isActive: true
  },
  {
    busNumber: 'BUS003',
    busType: 'Deluxe',
    source: 'Bangalore',
    destination: 'Chennai',
    departureDate: new Date('2025-04-01T07:30:00'),
    departureTime: '07:30',
    arrivalTime: '11:00',
    fareInRupees: 600,
    totalSeats: 45,
    availableSeats: 45,
    bookingOpenDateTime: new Date(new Date('2025-04-01T07:30:00').setHours(new Date('2025-04-01T07:30:00').getHours() - 24)),
    bookingCloseDateTime: new Date(new Date('2025-04-01T07:30:00').setHours(new Date('2025-04-01T07:30:00').getHours() - 1)),
    isActive: true
  }
];

async function addSampleBuses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Clear existing buses
    await Bus.deleteMany({});

    // Add sample buses
    const addedBuses = await Bus.create(sampleBuses);
    console.log('Sample buses added successfully:', addedBuses.length);

    // Disconnect from MongoDB
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error adding sample buses:', error);
    process.exit(1);
  }
}

addSampleBuses();
