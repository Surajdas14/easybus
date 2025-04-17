const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  seat: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false
  }
});

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: false
  },
  seats: {
    type: [String],
    required: true
  },
  passengers: {
    type: [passengerSchema],
    required: false
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  departureTime: {
    type: String,
    required: false
  },
  arrivalTime: {
    type: String,
    required: false
  },
  fareInRupees: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update bus seat status after booking
bookingSchema.post('save', async function(doc) {
  if (this.status === 'pending' || this.status === 'confirmed') {
    const Bus = mongoose.model('Bus');
    const bus = await Bus.findById(this.bus);
    
    if (!bus) return;
    
    // Update each seat status
    for (const seatNumber of this.seats) {
      const busSeat = bus.seats.find(s => s.number === seatNumber);
      if (busSeat) {
        busSeat.isBooked = true;
      }
    }
    
    // Update available seats count
    bus.availableSeats = Math.max(0, bus.availableSeats - this.seats.length);
    await bus.save();
  }
});

// Free up seat when booking is cancelled
bookingSchema.post('save', async function(doc) {
  if (this.status === 'cancelled') {
    const Bus = mongoose.model('Bus');
    const bus = await Bus.findById(this.bus);
    
    if (!bus) return;
    
    // Update each seat status
    for (const seatNumber of this.seats) {
      const busSeat = bus.seats.find(s => s.number === seatNumber);
      if (busSeat) {
        busSeat.isBooked = false;
      }
    }
    
    // Update available seats count
    bus.availableSeats = Math.min(bus.totalSeats, bus.availableSeats + this.seats.length);
    await bus.save();
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
