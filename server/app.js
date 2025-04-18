const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const busRoutes = require('./routes/busRoutes');
const bookingRoutes = require('./routes/bookings');
const agentRoutes = require('./routes/agents');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

const app = express();

// CORS configuration
const corsOptions = process.env.NODE_ENV === 'development' ? {
  origin: true,  // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
} : {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://easybus.com',
      'https://www.easybus.com',
      'https://easybus.onrender.com',
      'https://*.onrender.com',  // Allow all Render subdomains
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:50309'  // Add browser preview port
    ];
    
    // Check if origin is allowed or if it's a Render.com domain
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('onrender.com') || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Other middleware
app.use(express.json());
app.use(morgan('dev'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!require('fs').existsSync(uploadsDir)) {
  require('fs').mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve uploaded files
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method !== 'GET') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  const clientBuildPath = path.join(__dirname, '../client/build');
  
  // Check if the build directory exists
  if (require('fs').existsSync(clientBuildPath)) {
    console.log('Serving static files from:', clientBuildPath);
    app.use(express.static(clientBuildPath));
  
    // For any route that is not an API route, serve the index.html
    app.get('*', (req, res, next) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.resolve(clientBuildPath, 'index.html'));
      } else {
        next();
      }
    });
  } else {
    console.warn('Client build directory not found at:', clientBuildPath);
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5001;

// Start server only after successful MongoDB connection
const startServer = async () => {
  try {
    // Connect to MongoDB first
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('MongoDB Connected Successfully');
    console.log('Database:', mongoose.connection.name);

    // Start Express server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Environment:', process.env.NODE_ENV);
      console.log('Available routes:');
      console.log('- /api/auth/admin/login (POST)');
      console.log('- /api/admin/buses (GET, POST)');
      console.log('- /api/admin/buses/:id (GET, PATCH, DELETE)');
    });

    // Handle server errors with more detailed logging
    server.on('error', (error) => {
      console.error('Server startup error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please check running processes.`);
        console.error('To find the process, use:');
        console.error(`netstat -ano | findstr :${PORT}`);
        console.error(`taskkill /F /PID <PID>`);
        process.exit(1);
      }
    });

    // Handle MongoDB connection errors
    mongoose.connection.on('error', err => {
      console.error('MongoDB Error:', err);
    });

    // Handle process termination
    process.on('SIGTERM', () => {
      console.log('Shutting down server...');
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log('Server and database connection closed.');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
