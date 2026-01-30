import Subscription from '../models/subscriptionModel.js';
import Meal from '../models/mealModel.js';
import Order from '../models/orderModel.js';

// Create new subscription
export const createSubscription = async (req, res) => {
    try {
        const {
            mealId,
            planType,
            deliveryTime,
            deliveryDays,
            deliveryAddress,
            startDate
        } = req.body;
        
        const meal = await Meal.findById(mealId);
        if (!meal) {
            return res.status(404).json({ success: false, message: 'Meal not found' });
        }
        
        // Calculate pricing
        let pricePerDay, totalPrice, endDate;
        const start = new Date(startDate);
        
        if (planType === 'weekly') {
            pricePerDay = meal.weeklyPrice || meal.price * 0.9; // 10% discount
            endDate = new Date(start);
            endDate.setDate(endDate.getDate() + 7);
            totalPrice = pricePerDay * 7;
        } else if (planType === 'monthly') {
            pricePerDay = meal.monthlyPrice || meal.price * 0.8; // 20% discount
            endDate = new Date(start);
            endDate.setMonth(endDate.getMonth() + 1);
            totalPrice = pricePerDay * 30;
        } else {
            return res.status(400).json({ success: false, message: 'Invalid plan type' });
        }
        
        const subscription = new Subscription({
            user: req.userId,
            meal: mealId,
            planType,
            pricePerDay,
            totalPrice,
            startDate: start,
            endDate,
            deliveryTime,
            deliveryDays: deliveryDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            deliveryAddress
        });
        
        await subscription.save();
        await subscription.populate('meal', 'name images price');
        
        res.status(201).json({
            success: true,
            message: 'Subscription created successfully',
            data: subscription
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user's subscriptions
export const getUserSubscriptions = async (req, res) => {
    try {
        const { status } = req.query;
        
        const query = { user: req.userId };
        if (status && status !== 'all') {
            query.status = status;
        }
        
        const subscriptions = await Subscription.find(query)
            .sort({ createdAt: -1 })
            .populate('meal', 'name images price category');
        
        res.json({ success: true, data: subscriptions });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get single subscription
export const getSubscriptionById = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            _id: req.params.id,
            user: req.userId
        }).populate('meal', 'name images price category description');
        
        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found' });
        }
        
        res.json({ success: true, data: subscription });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Pause subscription
export const pauseSubscription = async (req, res) => {
    try {
        const { pauseDate } = req.body;
        
        const subscription = await Subscription.findOne({
            _id: req.params.id,
            user: req.userId
        });
        
        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found' });
        }
        
        if (subscription.status !== 'active') {
            return res.status(400).json({ 
                success: false, 
                message: 'Only active subscriptions can be paused' 
            });
        }
        
        if (pauseDate) {
            subscription.pausedDates.push(new Date(pauseDate));
        } else {
            subscription.status = 'paused';
        }
        
        await subscription.save();
        
        res.json({
            success: true,
            message: 'Subscription paused',
            data: subscription
        });
    } catch (error) {
        console.error('Error pausing subscription:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Resume subscription
export const resumeSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            _id: req.params.id,
            user: req.userId
        });
        
        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found' });
        }
        
        if (subscription.status !== 'paused') {
            return res.status(400).json({ 
                success: false, 
                message: 'Only paused subscriptions can be resumed' 
            });
        }
        
        subscription.status = 'active';
        await subscription.save();
        
        res.json({
            success: true,
            message: 'Subscription resumed',
            data: subscription
        });
    } catch (error) {
        console.error('Error resuming subscription:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            _id: req.params.id,
            user: req.userId
        });
        
        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found' });
        }
        
        if (subscription.status === 'cancelled' || subscription.status === 'completed') {
            return res.status(400).json({ 
                success: false, 
                message: 'Subscription is already cancelled or completed' 
            });
        }
        
        subscription.status = 'cancelled';
        await subscription.save();
        
        res.json({
            success: true,
            message: 'Subscription cancelled',
            data: subscription
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ============ ADMIN FUNCTIONS ============

// Get all subscriptions (admin)
export const getAllSubscriptions = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [subscriptions, total] = await Promise.all([
            Subscription.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('user', 'name email phone')
                .populate('meal', 'name images price'),
            Subscription.countDocuments(query)
        ]);
        
        res.json({
            success: true,
            data: subscriptions,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update subscription status (admin)
export const updateSubscriptionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const validStatuses = ['active', 'paused', 'cancelled', 'completed', 'expired'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        
        const subscription = await Subscription.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('user', 'name email').populate('meal', 'name');
        
        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found' });
        }
        
        res.json({
            success: true,
            message: 'Subscription status updated',
            data: subscription
        });
    } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
