const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
require('dotenv').config();
const { register, verifyOTP, resendOTP, login } = require('../controllers/authController');
const Agent = require('../models/Agent');
const { auth, generateToken, generateRefreshToken } = require('../middleware/auth');

// User Registration and Verification Routes
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);

// Debug route to check admin credentials (REMOVE IN PRODUCTION)
router.get('/check-admin-config', (req, res) => {
  const envAdminEmail = process.env.ADMIN_EMAIL;
  const envAdminPassword = process.env.ADMIN_PASSWORD;
  
  console.log('Admin credentials from .env:', { 
    email: envAdminEmail, 
    password: envAdminPassword ? 'Password exists' : 'Password missing' 
  });
  
  // Only return the email to avoid exposing password in logs
  res.json({ 
    adminEmailConfigured: Boolean(envAdminEmail),
    adminEmail: envAdminEmail,
    message: 'This route is for debugging purposes only' 
  });
});

// Admin login route
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Admin login attempt:', { email, submittedPassword: !!password });

    // Get admin credentials from environment variables
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    // Enhanced debugging
    console.log('ENV admin credentials:', { 
      configuredEmail: ADMIN_EMAIL,
      configuredPasswordExists: !!ADMIN_PASSWORD, 
      emailMatch: email === ADMIN_EMAIL,
      passwordMatch: password === ADMIN_PASSWORD
    });

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error('Admin credentials not configured in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Validate credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      console.warn('Invalid admin login attempt:', { 
        email,
        correctEmail: ADMIN_EMAIL,
        emailMatches: email === ADMIN_EMAIL,
        passwordMatches: password === ADMIN_PASSWORD
      });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const { token } = generateToken({ role: 'admin', email: ADMIN_EMAIL });
    const { refreshToken } = generateRefreshToken({ role: 'admin', email: ADMIN_EMAIL });

    console.log('Admin login successful:', { email });

    // Send token in response
    res.json({
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        email: ADMIN_EMAIL,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Error in admin login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Agent Login
router.post('/agent/login', async (req, res) => {
  try {
    const { userId, email, password } = req.body;
    
    // Support both userId and email for login
    let query = {};
    if (userId) {
      query.userId = userId;
    } else if (email) {
      query.email = email;
    } else {
      return res.status(400).json({ message: 'Please provide either userId or email' });
    }

    console.log('Agent login attempt with query:', query);

    // Check if agent exists
    const agent = await Agent.findOne(query);
    if (!agent) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await agent.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if agent is active
    if (!agent.isActive) {
      console.log('Agent login failed: account inactive', agent.userId);
      return res.status(401).json({ message: 'Agent account is inactive' });
    }
    
    // Check if agent is verified - only if the field exists
    // This might not be in the schema for existing agents, so we check if it exists first
    if (agent.isVerified === false) {
      console.log('Agent login failed: account not verified', agent.userId);
      return res.status(401).json({ message: 'Your account is not verified yet. Please contact admin for verification.' });
    }

    console.log('Agent login successful for:', agent.userId, 'with role:', 'agent');

    // Generate tokens with proper role
    const { token } = generateToken({ agentId: agent._id, role: 'agent' });
    const { refreshToken } = generateRefreshToken({ agentId: agent._id, role: 'agent' });

    res.json({
      token,
      refreshToken,
      user: {
        id: agent._id,
        name: agent.ownerName || agent.agencyName,
        email: agent.email,
        userId: agent.userId,
        role: 'agent'
      }
    });
  } catch (error) {
    console.error('Agent login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.headers.authorization?.split(' ')[1];
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    if (!process.env.REFRESH_TOKEN_SECRET) {
      console.error('REFRESH_TOKEN_SECRET is not set in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      
      // Generate new tokens
      const { token } = generateToken({ role: decoded.role, email: decoded.email });
      const { refreshToken: newRefreshToken } = generateRefreshToken({ role: decoded.role, email: decoded.email });

      res.json({
        token,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
