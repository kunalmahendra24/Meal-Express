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
// Granting and revoking access is the super admin's alone: a kitchen admin must not be able
// to promote anyone, nor lock out a peer or the super admin by deactivating their account
router.patch('/users/:id/role', superAdminMiddleware, updateUserRole);
router.patch('/users/:id/toggle-status', superAdminMiddleware, toggleUserStatus);
router.delete('/users/:id', superAdminMiddleware, deleteUser);

export default router;
