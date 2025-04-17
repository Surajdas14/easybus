const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const { auth, isAdmin, isAgent } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create directory if it doesn't exist
    const dir = 'uploads/agents';
    require('fs').mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'agent-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpeg, .jpg and .png files are allowed'));
    }
  }
});

// Apply auth middleware to all routes
router.use(auth);

// These routes apply admin-only access
// Get all agents (protected, admin only)
router.get('/', isAdmin, async (req, res) => {
  try {
    console.log('Fetching all agents...');
    const agents = await Agent.find()
      .select('-password')
      .sort({ createdAt: -1 });
    console.log('Found agents:', agents.length);
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ message: 'Error fetching agents', error: error.message });
  }
});

// Get agent stats (protected, admin only)
router.get('/stats', isAdmin, async (req, res) => {
  try {
    console.log('Fetching agent stats...');
    const totalAgents = await Agent.countDocuments();
    const activeAgents = await Agent.countDocuments({ status: 'active' });
    const pendingAgents = await Agent.countDocuments({ status: 'pending' });
    const suspendedAgents = await Agent.countDocuments({ status: 'suspended' });

    const stats = {
      total: totalAgents,
      active: activeAgents,
      pending: pendingAgents,
      suspended: suspendedAgents
    };
    console.log('Agent stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    res.status(500).json({ message: 'Error fetching agent stats', error: error.message });
  }
});

// Create new agent (protected, admin only)
router.post('/', isAdmin, upload.single('logo'), async (req, res) => {
  try {
    console.log('Creating new agent:', req.body);
    const {
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
      password
    } = req.body;

    // Check if agent already exists with email or userId
    let existingAgent = await Agent.findOne({ $or: [{ email }, { userId }] });
    if (existingAgent) {
      return res.status(400).json({ 
        message: existingAgent.email === email ? 
          'An agent with this email already exists' : 
          'This User ID is already taken'
      });
    }

    // Create new agent
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
      logo: req.file ? `/uploads/agents/${req.file.filename}` : null
    });

    await agent.save();

    // Remove password from response
    const agentResponse = agent.toObject();
    delete agentResponse.password;

    console.log('Agent created:', agent);
    res.status(201).json({
      message: 'Agent registered successfully',
      agent: agentResponse
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ message: 'Error creating agent', error: error.message });
  }
});

// Update agent (protected, admin only)
router.patch('/:id', isAdmin, upload.single('logo'), async (req, res) => {
  try {
    console.log('Updating agent:', req.params.id);
    const updateData = { ...req.body };
    if (req.file) {
      updateData.logo = `/uploads/agents/${req.file.filename}`;
    }
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');
    console.log('Agent updated:', agent);
    res.json(agent);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ message: 'Error updating agent', error: error.message });
  }
});

// Delete agent (protected, admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    console.log('Deleting agent:', req.params.id);
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    // Delete agent's logo file if it exists
    if (agent.logo) {
      const fs = require('fs');
      const logoPath = path.join(__dirname, '..', agent.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    console.log('Agent deleted successfully');
    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ message: 'Error deleting agent', error: error.message });
  }
});

// Verify agent (protected, admin only)
router.patch('/:id/verify', isAdmin, async (req, res) => {
  try {
    console.log('Verifying agent:', req.params.id);
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    ).select('-password');
    console.log('Agent verified:', agent);
    res.json(agent);
  } catch (error) {
    console.error('Error verifying agent:', error);
    res.status(500).json({ message: 'Error verifying agent', error: error.message });
  }
});

// Update agent status (protected, admin only)
router.patch('/:id/status', isAdmin, async (req, res) => {
  try {
    console.log('Updating agent status:', req.params.id);
    const { status } = req.body;
    if (!['active', 'pending', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    console.log('Agent status updated:', agent);
    res.json(agent);
  } catch (error) {
    console.error('Error updating agent status:', error);
    res.status(500).json({ message: 'Error updating agent status', error: error.message });
  }
});

// Get current agent's own profile (agent only)
router.get('/self/profile', auth, isAgent, async (req, res) => {
  try {
    console.log('Agent requesting own profile:', req.user.id);
    
    const agent = await Agent.findById(req.user.id).select('-password');
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    console.log('Agent profile found:', agent._id);
    res.json(agent);
  } catch (error) {
    console.error('Error fetching agent profile:', error);
    res.status(500).json({ message: 'Error fetching agent profile', error: error.message });
  }
});

// Get agent by ID (protected, admin and self access)
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching agent:', req.params.id);
    
    // Check if the user is an agent trying to access their own profile
    if (req.user.role === 'agent' && req.user.id === req.params.id) {
      console.log('Agent accessing own profile:', req.user.id);
    } else if (req.user.role !== 'admin') {
      // If not admin and not own profile, deny access
      console.log('Access denied - user is not admin and not the agent owner');
      return res.status(403).json({ message: 'Access denied. Admin rights required.' });
    }
    
    const agent = await Agent.findById(req.params.id).select('-password');
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    console.log('Agent found:', agent);
    res.json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ message: 'Error fetching agent', error: error.message });
  }
});

module.exports = router;
