import express from 'express';
import {
    getDashboardStats,
    getAllUsers,
    getUserDetails,
    updateUserRole,
    toggleUserStatus,
    deleteUser
} from '../controller/admin.controller.js';
import adminMiddleware, { superAdminMiddleware } from '../middleware/admin.auth.js';

const router = express.Router();

// Dashboard
router.get('/dashboard', adminMiddleware, getDashboardStats);

// User management
router.get('/users', adminMiddleware, getAllUsers);
router.get('/users/:id', adminMiddleware, getUserDetails);
router.patch('/users/:id/role', superAdminMiddleware, updateUserRole);
router.patch('/users/:id/toggle-status', adminMiddleware, toggleUserStatus);
router.delete('/users/:id', superAdminMiddleware, deleteUser);

export default router;
