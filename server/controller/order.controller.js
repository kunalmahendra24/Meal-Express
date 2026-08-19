import Order from '../models/orderModel.js';
import Meal from '../models/mealModel.js';
import Settings from '../models/settingsModel.js';
import { emitOrderNew, emitOrderStatusUpdated } from '../socket/emit.js';

// Returns the order already created for this key, so a retry never places a second one
const respondWithExistingOrder = async (res, existingOrder) => {
    await existingOrder.populate('user', 'name email phone');
    return res.status(200).json({
        success: true,
        message: 'Order already placed for this request',
        data: existingOrder
    });
};

// Create new order
export const createOrder = async (req, res) => {
    try {
        const { items, deliveryAddress, paymentMethod, deliveryInstructions } = req.body;
        
        // Optional: absent header keeps the original behaviour untouched
        const headerKey = req.headers['idempotency-key'];
        const idempotencyKey = typeof headerKey === 'string' ? headerKey.trim() : '';
        
        // Cheap pre-check catches the common double-click before any pricing work
        if (idempotencyKey) {
            const existingOrder = await Order.findOne({ user: req.userId, idempotencyKey });
            if (existingOrder) {
                return respondWithExistingOrder(res, existingOrder);
            }
        }
        
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No items in order' });
        }
        
        // Reject 0, negative and fractional quantities before they reach the price math
        for (const item of items) {
            if (!Number.isInteger(item.quantity) || item.quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid quantity for meal: ${item.mealId}`
                });
            }
        }
        
        // One query for the whole cart instead of a findById per line item (N+1)
        const meals = await Meal.find({ _id: { $in: items.map(item => item.mealId) } });
        const mealsById = new Map(meals.map(meal => [meal._id.toString(), meal]));
        
        // Validate and calculate total
        let totalAmount = 0;
        const orderItems = [];
        const kitchenIds = new Set();
        
        for (const item of items) {
            const meal = mealsById.get(String(item.mealId));
            if (!meal) {
                return res.status(404).json({ 
                    success: false, 
                    message: `Meal not found: ${item.mealId}` 
                });
            }
            if (!meal.isAvailable) {
                return res.status(400).json({ 
                    success: false, 
                    message: `${meal.name} is currently unavailable` 
                });
            }
            if (!meal.kitchen) {
                return res.status(400).json({
                    success: false,
                    message: `${meal.name} is not linked to a kitchen and cannot be ordered`
                });
            }
            
            kitchenIds.add(meal.kitchen.toString());
            
            const itemTotal = meal.price * item.quantity;
            totalAmount += itemTotal;
            
            orderItems.push({
                meal: meal._id,
                name: meal.name,
                price: meal.price,
                quantity: item.quantity,
                image: meal.images[0] || ''
            });
        }
        
        // One order = one kitchen
        if (kitchenIds.size > 1) {
            return res.status(400).json({
                success: false,
                message: 'An order can only contain items from one kitchen'
            });
        }
        
        const [kitchenId] = [...kitchenIds];
        
        // Check minimum order amount
        const minOrderAmount = await Settings.getSetting('minimum_order_amount', 100);
        if (totalAmount < minOrderAmount) {
            return res.status(400).json({ 
                success: false, 
                message: `Minimum order amount is ₹${minOrderAmount}` 
            });
        }
        
        // Add delivery charge
        const deliveryCharge = await Settings.getSetting('delivery_charge', 30);
        const freeDeliveryAbove = await Settings.getSetting('free_delivery_above', 500);
        
        if (totalAmount < freeDeliveryAbove) {
            totalAmount += deliveryCharge;
        }
        
        // Calculate estimated delivery time (current time + 45 minutes)
        const estimatedDeliveryTime = new Date(Date.now() + 45 * 60 * 1000);
        
        const order = new Order({
            user: req.userId,
            kitchen: kitchenId,
            items: orderItems,
            totalAmount,
            deliveryAddress,
            paymentMethod: paymentMethod || 'cod',
            deliveryInstructions,
            estimatedDeliveryTime,
            // Never store an empty string: it would be indexed and collide across keyless orders
            ...(idempotencyKey ? { idempotencyKey } : {})
        });
        
        try {
            await order.save();
        } catch (error) {
            // Two concurrent submits both cleared the pre-check; the unique index rejected the loser
            if (error.code === 11000 && idempotencyKey) {
                const existingOrder = await Order.findOne({ user: req.userId, idempotencyKey });
                if (existingOrder) {
                    return respondWithExistingOrder(res, existingOrder);
                }
            }
            throw error;
        }
        
        await order.populate('user', 'name email phone');

        const io = req.app.get('io');
        emitOrderNew(io, order);

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: order
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        const query = { user: req.userId };
        if (status && status !== 'all') {
            query.status = status;
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [orders, total] = await Promise.all([
            Order.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('items.meal', 'name images')
                .populate('kitchen', 'name phone'),
            Order.countDocuments(query)
        ]);
        
        res.json({
            success: true,
            data: orders,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get single order details
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.userId
        }).populate('items.meal', 'name images category')
          .populate('kitchen', 'name phone');
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        res.json({ success: true, data: order });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Cancel order (user can only cancel pending orders)
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.userId
        });
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        if (order.status !== 'pending' && order.status !== 'confirmed') {
            return res.status(400).json({ 
                success: false, 
                message: 'Order cannot be cancelled at this stage' 
            });
        }
        
        order.status = 'cancelled';
        await order.save();

        const io = req.app.get('io');
        emitOrderStatusUpdated(io, order);

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ============ ADMIN FUNCTIONS ============

// Reject reads/writes by an admin against another kitchen's order
const denyCrossKitchenOrder = (req, order) => {
    if (req.userRole === 'super_admin') return false;
    return order.kitchen?.toString() !== req.kitchenId;
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, startDate, endDate, kitchen } = req.query;
        
        const query = {};
        
        if (req.userRole === 'admin') {
            // An admin only ever sees their own kitchen's orders
            if (!req.kitchenId) {
                return res.json({
                    success: true,
                    data: [],
                    pagination: { total: 0, page: parseInt(page), pages: 0 }
                });
            }
            query.kitchen = req.kitchenId;
        } else if (kitchen && kitchen !== 'all') {
            query.kitchen = kitchen;
        }
        
        if (status && status !== 'all') {
            query.status = status;
        }
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [orders, total] = await Promise.all([
            Order.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('user', 'name email phone')
                .populate('kitchen', 'name phone'),
            Order.countDocuments(query)
        ]);
        
        res.json({
            success: true,
            data: orders,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update order status (admin)
export const updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body;
        
        const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        if (denyCrossKitchenOrder(req, order)) {
            return res.status(403).json({
                success: false,
                message: 'You can only manage orders from your own kitchen'
            });
        }
        
        order.status = status;
        order.statusHistory.push({
            status,
            timestamp: new Date(),
            ...(note ? { note } : {})
        });

        if (status === 'delivered') {
            order.actualDeliveryTime = new Date();
            if (order.paymentMethod === 'cod') {
                order.paymentStatus = 'paid';
            }
        }

        await order.save();

        const io = req.app.get('io');
        emitOrderStatusUpdated(io, order);

        res.json({
            success: true,
            message: 'Order status updated',
            data: order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get order details for admin (without user restriction)
export const getOrderDetailsAdmin = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('items.meal', 'name images category');
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        if (denyCrossKitchenOrder(req, order)) {
            return res.status(403).json({
                success: false,
                message: 'You can only view orders from your own kitchen'
            });
        }
        
        await order.populate('kitchen', 'name phone');
        
        res.json({ success: true, data: order });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
