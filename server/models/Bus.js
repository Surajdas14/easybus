const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  }
});

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  busType: {
    type: String,
    required: true,
    enum: ['AC', 'Non-AC', 'Deluxe', 'Super Deluxe'],
    default: 'AC'
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  departureDate: {
    type: Date,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },
  arrivalTime: {
    type: String,
    required: true
  },
  bookingOpenTime: {
    type: String,
    required: true,
    default: '00:00'
  },
  bookingCloseTime: {
    type: String,
    required: true,
    default: '23:59'
  },
  bookingOpenDateTime: {
    type: Date,
    default: function() {
      if (!this.departureDate || !this.bookingOpenTime) return new Date();
      
      const openDateTime = new Date(this.departureDate);
      const [openHours, openMinutes] = this.bookingOpenTime.split(':').map(Number);
      
      openDateTime.setHours(openHours, openMinutes, 0, 0);
      return openDateTime;
    }
  },
  bookingCloseDateTime: {
    type: Date,
    default: function() {
      if (!this.departureDate || !this.bookingCloseTime) return new Date();
      
      const closeDateTime = new Date(this.departureDate);
      const [closeHours, closeMinutes] = this.bookingCloseTime.split(':').map(Number);
      
      closeDateTime.setHours(closeHours, closeMinutes, 0, 0);
      return closeDateTime;
    }
  },
  fareInRupees: {
    type: Number,
    required: true,
    min: 0
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1
  },
  seatArrangement: {
    type: String,
    required: true,
    enum: ['2-2', '2-1', '1-1'],
    default: '2-2'
  },
  firstRowSeats: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
    default: 2
  },
  lastRowSeats: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 3
  },
  seats: [seatSchema],
  availableSeats: {
    type: Number,
    default: function() { return this.totalSeats || 0; }
  },
  advanceBookingDays: {
    type: Number,
    default: 30,
    min: 0,
    max: 90
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Method to generate seats based on configuration
busSchema.methods.generateSeats = function() {
  const seatsArray = [];
  let seatNumber = 1;
  const rowsNeeded = Math.ceil(this.totalSeats / this.getSeatCountPerRow());

  for (let row = 1; row <= rowsNeeded; row++) {
    const seatsInThisRow = this.getSeatsForRow(row, rowsNeeded);
    for (let seat = 1; seat <= seatsInThisRow; seat++) {
      if (seatNumber <= this.totalSeats) {
        seatsArray.push({
          seatNumber: seatNumber.toString(),
          isBooked: false,
          bookingId: null
        });
        seatNumber++;
      }
    }
  }
  this.seats = seatsArray;
};

// Helper method to get seats per row based on arrangement
busSchema.methods.getSeatCountPerRow = function() {
  switch (this.seatArrangement) {
    case '2-2': return 4;
    case '2-1': return 3;
    case '1-1': return 2;
    default: return 4;
  }
};

// Helper method to get seats for a specific row
busSchema.methods.getSeatsForRow = function(currentRow, totalRows) {
  if (currentRow === 1) {
    return this.firstRowSeats;
  } else if (currentRow === totalRows) {
    return this.lastRowSeats;
  } else {
    return this.getSeatCountPerRow();
  }
};

// Pre-save middleware to generate seats if they don't exist
busSchema.pre('save', function(next) {
  if (!this.seats || this.seats.length === 0) {
    this.generateSeats();
  }
  next();
});

// Method to check seat availability
busSchema.methods.checkSeatAvailability = function(seatNumbers) {
  return seatNumbers.every(seatNumber => {
    const seat = this.seats.find(s => s.seatNumber === seatNumber);
    return seat && !seat.isBooked;
  });
};

// Method to book seats
busSchema.methods.bookSeats = function(seatNumbers, bookingId) {
  seatNumbers.forEach(seatNumber => {
    const seat = this.seats.find(s => s.seatNumber === seatNumber);
    if (seat) {
      seat.isBooked = true;
      seat.bookingId = bookingId;
    }
  });
  return this.save();
};

// Method to cancel seat booking
busSchema.methods.cancelSeats = function(bookingId) {
  this.seats.forEach(seat => {
    if (seat.bookingId && seat.bookingId.equals(bookingId)) {
      seat.isBooked = false;
      seat.bookingId = null;
    }
  });
  return this.save();
};

const Bus = mongoose.model('Bus', busSchema);
module.exports = Bus;
