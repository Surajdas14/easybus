const User = require('../models/User');
const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const Agent = require('../models/Agent');

const getDashboardStats = async (req, res) => {
    try {
        // Ensure only admin can access this route
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Fetch total users
        const totalUsers = await User.countDocuments();

        // Fetch total bookings
        const totalBookings = await Booking.countDocuments();

        // Fetch active buses
        const activeBuses = await Bus.countDocuments({ status: 'active' });

        // Calculate total revenue (assuming each booking has a price)
        const revenueResult = await Booking.aggregate([
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Fetch recent agents
        const agents = await Agent.find({ status: 'active' })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email phone');

        // Fetch recent bookings
        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name email')
            .populate('bus', 'busNumber route');

        res.json({
            totalUsers,
            totalBookings,
            activeBuses,
            totalRevenue,
            agents,
            recentBookings
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
};

module.exports = {
    getDashboardStats
};
