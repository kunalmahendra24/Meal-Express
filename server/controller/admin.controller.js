import User from '../models/userModel.js';
import Order from '../models/orderModel.js';
import Subscription from '../models/subscriptionModel.js';
import Meal from '../models/mealModel.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        // Basic counts
        const [
            totalUsers,
            totalMeals,
            totalOrders,
            activeSubscriptions,
            todayOrders,
            weekOrders,
            monthOrders
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Meal.countDocuments(),
            Order.countDocuments(),
            Subscription.countDocuments({ status: 'active' }),
            Order.countDocuments({ createdAt: { $gte: today } }),
            Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
            Order.countDocuments({ createdAt: { $gte: startOfMonth } })
        ]);
        
        // Revenue calculations
        const [todayRevenue, weekRevenue, monthRevenue, totalRevenue] = await Promise.all([
            Order.aggregate([
                { $match: { createdAt: { $gte: today }, status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: startOfWeek }, status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Order.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ])
        ]);
        
        // Order status breakdown
        const orderStatusBreakdown = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        // Recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email');
        
        // Orders by day for last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            last7Days.push(date);
        }
        
        const dailyOrders = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: last7Days[0] }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        // Top selling meals
        const topMeals = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.meal',
                    name: { $first: '$items.name' },
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);
        
        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalMeals,
                    totalOrders,
                    activeSubscriptions
                },
                orders: {
                    today: todayOrders,
                    thisWeek: weekOrders,
                    thisMonth: monthOrders
                },
                revenue: {
                    today: todayRevenue[0]?.total || 0,
                    thisWeek: weekRevenue[0]?.total || 0,
                    thisMonth: monthRevenue[0]?.total || 0,
                    total: totalRevenue[0]?.total || 0
                },
                orderStatusBreakdown: orderStatusBreakdown.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                recentOrders,
                dailyOrders,
                topMeals
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all users (admin)
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, role } = req.query;
        
        const query = {};
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (role && role !== 'all') {
            query.role = role;
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password -verifyOtp -resetOtp')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);
        
        res.json({
            success: true,
            data: users,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get user details (admin)
export const getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -verifyOtp -resetOtp');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Get user's order history
        const orders = await Order.find({ user: user._id })
            .sort({ createdAt: -1 })
            .limit(10);
        
        // Get user's subscriptions
        const subscriptions = await Subscription.find({ user: user._id })
            .populate('meal', 'name images');
        
        res.json({
            success: true,
            data: {
                user,
                orders,
                subscriptions
            }
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update user role (admin)
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        const validRoles = ['user', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        if (req.params.id === req.userId) {
            return res.status(400).json({ success: false, message: 'You cannot change your own role' });
        }

        const target = await User.findById(req.params.id);
        if (!target) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (target.role === 'super_admin') {
            return res.status(403).json({ success: false, message: 'Cannot change a super admin role' });
        }

        target.role = role;
        await target.save();

        const user = await User.findById(target._id).select('-password -verifyOtp -resetOtp');

        res.json({
            success: true,
            message: 'User role updated',
            data: user
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Toggle user active status (admin)
export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        user.isActive = !user.isActive;
        await user.save();
        
        res.json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
            data: { isActive: user.isActive }
        });
    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete user (admin)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Prevent deleting super admin
        if (user.role === 'super_admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Cannot delete super admin' 
            });
        }
        
        await User.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
