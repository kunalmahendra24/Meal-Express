import express from 'express';
import {
    createOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus,
    getOrderDetailsAdmin
} from '../controller/order.controller.js';
import authMiddleware from '../middleware/user.auth.js';
import adminMiddleware from '../middleware/admin.auth.js';
import { validate } from '../validators/validate.js';
import { createOrderSchema } from '../validators/order.validators.js';

const router = express.Router();

// User routes
// Schema guard runs before the controller so malformed carts never reach the pricing logic
router.post('/', authMiddleware, validate(createOrderSchema), createOrder);
router.get('/my-orders', authMiddleware, getUserOrders);
router.get('/my-orders/:id', authMiddleware, getOrderById);
router.patch('/:id/cancel', authMiddleware, cancelOrder);

// Admin routes
router.get('/admin/all', adminMiddleware, getAllOrders);
router.get('/admin/:id', adminMiddleware, getOrderDetailsAdmin);
router.patch('/admin/:id/status', adminMiddleware, updateOrderStatus);

export default router;
