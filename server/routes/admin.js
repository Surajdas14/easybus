const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const User = require('../models/User');
const Bus = require('../models/Bus');
const Booking = require('../models/Booking');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const { auth, isAdmin } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/adminController');

// Apply authentication middleware to all routes
router.use(auth);
router.use(isAdmin);

// Get dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// Get admin profile
router.get('/profile', async (req, res) => {
  try {
    // Since we're using environment variables for admin credentials,
    // we'll return the admin email from there
    res.json({
      email: process.env.ADMIN_EMAIL,
      role: 'admin'
    });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ message: 'Error fetching admin profile' });
  }
});

// Change admin password
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Get admin credentials from environment variables
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    // Verify current password
    if (currentPassword !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password in environment variables
    // Note: In a production environment, you should use a proper database
    process.env.ADMIN_PASSWORD = newPassword;

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing admin password:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// Update admin email
router.post('/update-email', async (req, res) => {
  try {
    const { currentPassword, newEmail } = req.body;

    // Validate input
    if (!currentPassword || !newEmail) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Get admin credentials from environment variables
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    // Verify current password
    if (currentPassword !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update email in environment variables
    // Note: In a production environment, you should use a proper database
    process.env.ADMIN_EMAIL = newEmail;

    res.json({ message: 'Email updated successfully' });
  } catch (error) {
    console.error('Error updating admin email:', error);
    res.status(500).json({ message: 'Error updating email' });
  }
});

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    console.log('Fetching dashboard stats for admin:', req.user);

    // Get total users count
    const totalUsers = await User.countDocuments();
    console.log('Total users:', totalUsers);

    // Get total bookings and revenue
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email')
      .populate('bus', 'busNumber source destination departureDate')
      .populate('agent', 'agencyName email');
    
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    console.log('Total bookings:', totalBookings, 'Total revenue:', totalRevenue[0]?.total || 0);

    // Get buses count - both total and active
    const totalBuses = await Bus.countDocuments();
    const activeBuses = await Bus.countDocuments({ isActive: true });
    console.log('Total buses:', totalBuses, 'Active buses:', activeBuses);

    // If we have zero active buses, find all buses and log their isActive status
    if (activeBuses === 0) {
      const allBuses = await Bus.find({}, 'busNumber isActive');
      console.log('All buses with status:', allBuses.map(b => ({
        busNumber: b.busNumber,
        isActive: b.isActive
      })));
    }

    // Get top agents with their booking counts and commission
    const agents = await Agent.aggregate([
      { $match: { isVerified: true } },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'agent',
          as: 'bookings'
        }
      },
      {
        $project: {
          agencyName: 1,
          email: 1,
          logo: 1,
          commission: 1,
          totalBookings: { $size: '$bookings' },
          totalCommission: {
            $sum: {
              $map: {
                input: '$bookings',
                as: 'booking',
                in: {
                  $multiply: [
                    { $ifNull: ['$$booking.totalAmount', 0] },
                    { $divide: ['$commission', 100] }
                  ]
                }
              }
            }
          }
        }
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 }
    ]);

    console.log('Top agents:', agents);

    res.json({
      totalUsers,
      totalBookings,
      totalBuses,
      activeBuses,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentBookings: bookings.map(booking => ({
        _id: booking._id,
        user: booking.user,
        bus: booking.bus,
        totalAmount: booking.totalAmount,
        status: booking.status,
        seats: booking.seats,
        createdAt: booking.createdAt
      })),
      agents: agents.map(agent => ({
        _id: agent._id,
        agencyName: agent.agencyName,
        email: agent.email,
        logo: agent.logo,
        commission: agent.commission,
        totalBookings: agent.totalBookings,
        totalCommission: agent.totalCommission
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// Get all buses
router.get('/buses', async (req, res) => {
  try {
    console.log('Fetching all buses for admin:', req.user);
    const buses = await Bus.find().sort({ createdAt: -1 });
    res.json(buses);
  } catch (error) {
    console.error('Error fetching buses:', error);
    res.status(500).json({ message: 'Error fetching buses' });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpeg, .jpg and .png format allowed!'));
    }
  }
});

// Agent Management Routes
router.post('/agents', upload.single('logo'), async (req, res) => {
  try {
    const {
      agencyName, ownerName, email, phone, address, windowNumber,
      gstNumber, panNumber, bankName, accountNumber, ifscCode,
      commissionRate, userId, password
    } = req.body;

    const existingAgent = await Agent.findOne({ $or: [{ email }, { userId }] });
    if (existingAgent) {
      return res.status(400).json({ 
        message: 'Agent with this email or user ID already exists' 
      });
    }

    const agent = new Agent({
      agencyName,
      ownerName,
      email,
      phone,
      address,
      windowNumber,
      gstNumber,
      panNumber,
      bankName,
      accountNumber,
      ifscCode,
      commissionRate,
      userId,
      password,
      logo: req.file ? `/uploads/${req.file.filename}` : undefined
    });

    await agent.save();
    res.status(201).json({ 
      message: 'Agent created successfully',
      agent: {
        ...agent.toObject(),
        password: undefined
      }
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create agent' });
  }
});

router.get('/agents', async (req, res) => {
  try {
    const agents = await Agent.find({}, { password: 0 });
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ message: 'Failed to fetch agents' });
  }
});

router.patch('/agents/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, select: '-password' }
    );
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    console.error('Error updating agent status:', error);
    res.status(500).json({ message: 'Failed to update agent status' });
  }
});

router.delete('/agents/:id', async (req, res) => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ message: 'Failed to delete agent' });
  }
});

router.patch('/agents/:id', async (req, res) => {
  try {
    const updates = req.body;
    const agent = await Agent.findById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Remove password field if it's empty
    if (!updates.password) {
      delete updates.password;
    } else {
      // Hash the new password if provided
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    Object.keys(updates).forEach(key => {
      agent[key] = updates[key];
    });

    await agent.save();
    const agentToReturn = agent.toObject();
    delete agentToReturn.password;
    
    res.json(agentToReturn);
  } catch (error) {
    console.error('Error updating agent:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to update agent' });
  }
});

// Bus Management Routes
router.get('/buses/:id', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    res.json(bus);
  } catch (error) {
    console.error('Error fetching bus:', error);
    res.status(500).json({ message: 'Failed to fetch bus' });
  }
});

router.post('/buses', async (req, res) => {
  try {
    console.log('Creating new bus:', req.body);
    const bus = new Bus(req.body);
    await bus.save();
    console.log('Bus created successfully:', bus._id);
    res.status(201).json(bus);
  } catch (error) {
    console.error('Error creating bus:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create bus', error: error.message });
  }
});

router.patch('/buses/:id', async (req, res) => {
  try {
    console.log('Updating bus:', req.params.id);
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    console.log('Bus updated successfully:', bus._id);
    res.json(bus);
  } catch (error) {
    console.error('Error updating bus:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to update bus' });
  }
});

router.delete('/buses/:id', async (req, res) => {
  try {
    console.log('Deleting bus:', req.params.id);
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    console.log('Bus deleted successfully:', req.params.id);
    res.json({ message: 'Bus deleted successfully' });
  } catch (error) {
    console.error('Error deleting bus:', error);
    res.status(500).json({ message: 'Failed to delete bus' });
  }
});

// Admin Profile and Settings Routes
router.get('/profile', async (req, res) => {
  try {
    console.log('Profile route - User:', req.user);
    const admin = await User.findById(req.user._id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ message: 'Failed to fetch admin profile' });
  }
});

router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await User.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

router.post('/change-email', async (req, res) => {
  try {
    const { newEmail } = req.body;
    const admin = await User.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser._id.toString() !== admin._id.toString()) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    admin.email = newEmail;
    await admin.save();

    res.json({ message: 'Email updated successfully', email: newEmail });
  } catch (error) {
    console.error('Error changing email:', error);
    res.status(500).json({ message: 'Failed to change email' });
  }
});

// Add utility endpoint to fix booking times
router.get('/fix-booking-times', auth, isAdmin, async (req, res) => {
  try {
    console.log('Starting booking time correction process');
    
    // Find all buses
    const buses = await Bus.find({});
    let corrected = 0;
    let alreadyValid = 0;
    
    // Process each bus
    for (const bus of buses) {
      let needsUpdate = false;
      
      // Check if booking times are invalid (end time before start time)
      if (bus.bookingCloseTime && bus.bookingOpenTime &&
          bus.bookingCloseTime < bus.bookingOpenTime) {
        console.log(`Fixing invalid booking times for bus ${bus.busNumber}: ${bus.bookingOpenTime} - ${bus.bookingCloseTime}`);
        
        // Set to default full-day values
        bus.bookingOpenTime = '00:00';
        bus.bookingCloseTime = '23:59';
        needsUpdate = true;
      }
      
      // Fix missing booking times
      if (!bus.bookingOpenTime) {
        bus.bookingOpenTime = '00:00';
        needsUpdate = true;
      }
      
      if (!bus.bookingCloseTime) {
        bus.bookingCloseTime = '23:59';
        needsUpdate = true;
      }
      
      // Save if changes were made
      if (needsUpdate) {
        await bus.save();
        corrected++;
      } else {
        alreadyValid++;
      }
    }
    
    res.json({
      success: true,
      message: `Booking times correction completed. Fixed ${corrected} buses. ${alreadyValid} buses already had valid times.`
    });
  } catch (error) {
    console.error('Error fixing booking times:', error);
    res.status(500).json({
      success: false,
      message: 'Error fixing booking times',
      error: error.message
    });
  }
});

module.exports = router;
