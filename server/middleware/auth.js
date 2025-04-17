const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Agent = require('../models/Agent');

const generateToken = (payload) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set in environment variables');
    }

    const expiresIn = '1h'; // Token expires in 1 hour
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    
    // Calculate expiration timestamp
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour in milliseconds
    
    return { 
      token, 
      expiresAt 
    };
  } catch (error) {
    console.error('Token generation error:', error);
    throw error;
  }
};

const generateRefreshToken = (payload) => {
  try {
    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new Error('REFRESH_TOKEN_SECRET is not set in environment variables');
    }

    const expiresIn = '7d'; // Refresh token expires in 7 days
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn });
    
    // Calculate expiration timestamp
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
    
    return { 
      refreshToken, 
      expiresAt 
    };
  } catch (error) {
    console.error('Refresh token generation error:', error);
    throw error;
  }
};

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware - checking authorization header');
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No auth header or invalid format');
      return res.status(401).json({ message: 'No authentication token found' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('No token found in header');
      return res.status(401).json({ message: 'No authentication token found' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
      console.log('Verifying token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
      
      // Check if it's an admin token
      if (decoded.role === 'admin') {
        if (decoded.email === process.env.ADMIN_EMAIL) {
          console.log('Admin authentication successful');
          req.user = { 
            email: decoded.email, 
            role: 'admin'
          };
          return next();
        } else {
          console.log('Admin email mismatch');
          return res.status(401).json({ message: 'Invalid admin credentials' });
        }
      }

      // For regular users and agents
      if (decoded.role === 'user') {
        const user = await User.findById(decoded.userId);
        if (!user) {
          console.log('User not found in database');
          return res.status(401).json({ message: 'User not found' });
        }
        req.user = { 
          id: user._id, 
          email: user.email, 
          name: user.name,
          role: 'user'
        };
      } else if (decoded.role === 'agent') {
        console.log('Verifying agent token:', decoded);
        // Look for agent ID in multiple possible fields
        const agentId = decoded.agentId || decoded.userId || decoded.id;
        if (!agentId) {
          console.log('No agent ID found in token');
          return res.status(401).json({ message: 'Invalid agent token format' });
        }
        
        const agent = await Agent.findById(agentId);
        if (!agent) {
          console.log('Agent not found in database');
          return res.status(401).json({ message: 'Agent not found' });
        }
        
        req.user = { 
          id: agent._id, 
          email: agent.email, 
          name: agent.agencyName || agent.ownerName,
          role: 'agent'
        };
        console.log('Agent authentication successful:', req.user);
      }

      next();
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Admin rights required.' });
};

// Middleware to check if user is an agent
const isAgent = (req, res, next) => {
  console.log('Checking agent authorization:', req.user);
  if (req.user && req.user.role === 'agent') {
    return next();
  }
  return res.status(403).json({ 
    success: false,
    message: 'Access denied. Agent rights required.' 
  });
};

module.exports = {
  auth,
  isAdmin,
  isAgent,
  generateToken,
  generateRefreshToken
};
