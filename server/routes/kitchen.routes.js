import express from 'express';
import {
    getAllKitchens,
    getKitchenById,
    getAdminKitchens,
    createKitchen,
    updateKitchen,
    setKitchenStaff,
    deleteKitchen
} from '../controller/kitchen.controller.js';
import adminMiddleware, { superAdminMiddleware } from '../middleware/admin.auth.js';

const router = express.Router();

// Admin routes (declared before /:id so they are not swallowed by it)
router.get('/admin/all', adminMiddleware, getAdminKitchens);
router.post('/', superAdminMiddleware, createKitchen);
router.put('/:id', adminMiddleware, updateKitchen);
router.patch('/:id/staff', superAdminMiddleware, setKitchenStaff);
router.delete('/:id', superAdminMiddleware, deleteKitchen);

// Public routes
router.get('/', getAllKitchens);
router.get('/:id', getKitchenById);

export default router;
