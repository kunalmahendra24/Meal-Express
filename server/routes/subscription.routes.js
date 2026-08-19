import express from 'express';
import {
    createSubscription,
    getUserSubscriptions,
    getSubscriptionById,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    getAllSubscriptions,
    updateSubscriptionStatus
} from '../controller/subscription.controller.js';
import authMiddleware from '../middleware/user.auth.js';
import adminMiddleware from '../middleware/admin.auth.js';
import { validate } from '../validators/validate.js';
import { createSubscriptionSchema } from '../validators/subscription.validators.js';

const router = express.Router();

// User routes
// Schema guard runs before the controller so a bad plan type or date can't reach the pricing logic
router.post('/', authMiddleware, validate(createSubscriptionSchema), createSubscription);
router.get('/my-subscriptions', authMiddleware, getUserSubscriptions);
router.get('/my-subscriptions/:id', authMiddleware, getSubscriptionById);
router.patch('/:id/pause', authMiddleware, pauseSubscription);
router.patch('/:id/resume', authMiddleware, resumeSubscription);
router.patch('/:id/cancel', authMiddleware, cancelSubscription);

// Admin routes
router.get('/admin/all', adminMiddleware, getAllSubscriptions);
router.patch('/admin/:id/status', adminMiddleware, updateSubscriptionStatus);

export default router;
