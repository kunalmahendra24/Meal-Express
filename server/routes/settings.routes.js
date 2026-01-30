import express from 'express';
import {
    getPublicSettings,
    getOwnerPhone,
    getAllSettings,
    updateSetting,
    updateOwnerPhone,
    toggleCallOwner,
    initializeSettings
} from '../controller/settings.controller.js';
import adminMiddleware from '../middleware/admin.auth.js';

const router = express.Router();

// Public routes
router.get('/public', getPublicSettings);
router.get('/owner-phone', getOwnerPhone);

// Admin routes
router.get('/', adminMiddleware, getAllSettings);
router.put('/', adminMiddleware, updateSetting);
router.put('/owner-phone', adminMiddleware, updateOwnerPhone);
router.patch('/toggle-call-owner', adminMiddleware, toggleCallOwner);
router.post('/initialize', adminMiddleware, initializeSettings);

export default router;
