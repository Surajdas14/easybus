const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const busRoutes = require('./routes/buses');
const bookingRoutes = require('./routes/bookings');
const agentRoutes = require('./routes/agents');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:50309', 'http://gungun.review.in.net', 'https://0d4e-2409-40e6-21b-c87c-b92b-925-e4c8-57d5.ngrok.io'],
  credentials: true
}));
app.use(express.json());

// Debug middleware for all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Apply routes
    app.use('/api/auth', authRoutes);
    app.use('/api/buses', busRoutes);
    app.use('/api/bookings', bookingRoutes);
    app.use('/api/agents', agentRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/users', userRoutes);

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Global Error Handler:', err);
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message
      });
    });

    // Start server
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
