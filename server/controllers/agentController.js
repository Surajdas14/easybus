const Agent = require('../models/Agent');
const Booking = require('../models/Booking');

// Get agent statistics
const getAgentStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const agents = await Agent.aggregate([
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
          phone: 1,
          windowNumber: 1,
          isActive: 1,
          createdAt: 1,
          totalBookings: { $size: '$bookings' },
          totalCommission: {
            $sum: {
              $map: {
                input: '$bookings',
                as: 'booking',
                in: {
                  $cond: [
                    { $eq: ['$$booking.status', 'confirmed'] },
                    { $multiply: ['$$booking.fareInRupees', 0.1] }, // 10% commission
                    0
                  ]
                }
              }
            }
          }
        }
      },
      { $sort: { totalBookings: -1 } }
    ]);

    res.json(agents);
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all agents
const getAllAgents = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const agents = await Agent.find().select('-password');
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get agent by ID
const getAgentById = async (req, res) => {
  try {
    // Allow agents to access their own data
    if (req.user.role === 'agent' && req.user.id === req.params.id) {
      const agent = await Agent.findById(req.params.id).select('-password');
      if (!agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      
      return res.json(agent);
    }
    
    // Admin check for accessing any agent data
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const agent = await Agent.findById(req.params.id).select('-password');
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update agent status
const updateAgentStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json(agent);
  } catch (error) {
    console.error('Error updating agent status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify agent
const verifyAgent = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select('-password');

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json(agent);
  } catch (error) {
    console.error('Error verifying agent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete agent
const deleteAgent = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAgentStats,
  getAllAgents,
  getAgentById,
  updateAgentStatus,
  verifyAgent,
  deleteAgent
};
