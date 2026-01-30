import express from 'express';
import {
    getUserData,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    getAddresses,
    addToFavorites,
    removeFromFavorites,
    getFavorites
} from '../controller/user.controller.js';
import authMiddleware from '../middleware/user.auth.js';

const router = express.Router();

// Profile routes
router.get('/profile', authMiddleware, getUserData);
router.put('/profile', authMiddleware, updateProfile);

// Address routes
router.get('/addresses', authMiddleware, getAddresses);
router.post('/addresses', authMiddleware, addAddress);
router.put('/addresses/:addressId', authMiddleware, updateAddress);
router.delete('/addresses/:addressId', authMiddleware, deleteAddress);

// Favorites routes
router.get('/favorites', authMiddleware, getFavorites);
router.post('/favorites/:mealId', authMiddleware, addToFavorites);
router.delete('/favorites/:mealId', authMiddleware, removeFromFavorites);

export default router;
