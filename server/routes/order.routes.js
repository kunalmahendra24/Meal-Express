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

const router = express.Router();

// User routes
router.post('/', authMiddleware, createOrder);
router.get('/my-orders', authMiddleware, getUserOrders);
router.get('/my-orders/:id', authMiddleware, getOrderById);
router.patch('/:id/cancel', authMiddleware, cancelOrder);

// Admin routes
router.get('/admin/all', adminMiddleware, getAllOrders);
router.get('/admin/:id', adminMiddleware, getOrderDetailsAdmin);
router.patch('/admin/:id/status', adminMiddleware, updateOrderStatus);

export default router;
