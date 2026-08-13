import express from 'express';
import {
    getAllMeals,
    getMealById,
    createMeal,
    updateMeal,
    deleteMeal,
    toggleAvailability,
    getFeaturedMeals,
    getMealsByCategory
} from '../controller/meal.controller.js';
import adminMiddleware from '../middleware/admin.auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAllMeals);
router.get('/featured', getFeaturedMeals);
router.get('/category/:category', getMealsByCategory);
router.get('/:id', getMealById);

// Admin routes
router.post('/', adminMiddleware, createMeal);
router.put('/:id', adminMiddleware, updateMeal);
router.delete('/:id', adminMiddleware, deleteMeal);
router.patch('/:id/toggle-availability', adminMiddleware, toggleAvailability);

// Image upload route with error handling
router.post('/upload-image', adminMiddleware, (req, res) => {
    upload.single('image')(req, res, function (err) {
        if (err) {
            console.error('Multer error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
            }
            return res.status(400).json({ success: false, message: err.message || 'Error uploading file' });
        }
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }
        
        const imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: { url: imageUrl }
        });
    });
});

// Multiple images upload
router.post('/upload-images', adminMiddleware, upload.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No images uploaded' });
        }
        
        const imageUrls = req.files.map(file => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
        res.json({
            success: true,
            message: 'Images uploaded successfully',
            data: { urls: imageUrls }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
