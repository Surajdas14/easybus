const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateOTP, sendOTPEmail } = require('../utils/emailService');
const { generateToken, generateRefreshToken } = require('../middleware/auth');

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    // Create new user
    user = new User({
      name,
      email,
      password,
      phone,
      emailVerificationOTP: otp,
      otpExpiry,
      // In development mode, automatically verify email
      isEmailVerified: process.env.NODE_ENV === 'development'
    });

    // Save user
    await user.save();

    // In development mode, return tokens immediately
    if (process.env.NODE_ENV === 'development') {
      const token = generateToken({ userId: user._id, role: user.role });
      const refreshToken = generateRefreshToken({ userId: user._id, role: user.role });

      return res.status(201).json({
        message: 'Registration successful. Development mode: Email verification bypassed.',
        token,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
      res.status(201).json({ 
        message: 'Registration successful. Please verify your email.',
        userId: user._id 
      });
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      res.status(201).json({ 
        message: 'Registration successful but failed to send OTP email. Please contact support.',
        userId: user._id 
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

// Verify email with OTP
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (user.emailVerificationOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate tokens after successful verification
    const token = generateToken({ userId: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id, role: user.role });

    res.json({ 
      message: 'Email verified successfully',
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // In development mode, automatically verify email
    if (process.env.NODE_ENV === 'development') {
      user.isEmailVerified = true;
      await user.save();

      const token = generateToken({ userId: user._id, role: user.role });
      const refreshToken = generateRefreshToken({ userId: user._id, role: user.role });

      return res.json({
        message: 'Development mode: Email verification bypassed.',
        token,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    // Update user with new OTP
    user.emailVerificationOTP = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    try {
      // Send verification email
      await sendOTPEmail(user.email, otp);
      res.json({ message: 'OTP sent successfully' });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      res.status(500).json({ message: 'Failed to send OTP email' });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// User login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email }); // Detailed logging

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email); // Log when user is not found
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified (only in production)
    if (process.env.NODE_ENV !== 'development' && !user.isEmailVerified) {
      console.log('Unverified email:', email); // Log unverified email
      return res.status(401).json({ 
        message: 'Please verify your email first', 
        userId: user._id 
      });
    }

    // Validate password
    let isMatch;
    try {
      isMatch = await user.comparePassword(password);
    } catch (bcryptError) {
      console.error('Password comparison error:', bcryptError);
      return res.status(500).json({ message: 'Error validating password' });
    }

    if (!isMatch) {
      console.log('Password mismatch for:', email); // Log password mismatch
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    let token, expiresAt, refreshToken, refreshExpiresAt;
    try {
      const tokenResult = generateToken({ userId: user._id, role: user.role });
      token = tokenResult.token;
      expiresAt = tokenResult.expiresAt;

      const refreshTokenResult = generateRefreshToken({ userId: user._id, role: user.role });
      refreshToken = refreshTokenResult.refreshToken;
      refreshExpiresAt = refreshTokenResult.refreshExpiresAt;
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return res.status(500).json({ message: 'Error generating authentication tokens' });
    }

    // Return consistent response structure
    res.json({
      token,
      expiresAt,
      refreshToken,
      refreshExpiresAt,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Comprehensive login error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Server error during login', 
      errorDetails: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login
};
