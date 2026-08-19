import Meal from '../models/mealModel.js';
import Kitchen from '../models/kitchenModel.js';

// Fields of a kitchen that are safe to expose on public meal responses
const KITCHEN_PUBLIC_FIELDS = 'name phone upiId isActive';

// Get all meals (public)
export const getAllMeals = async (req, res) => {
    try {
        const { category, search, sort, page = 1, limit = 12, available, kitchen } = req.query;
        
        const query = {};
        
        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }
        
        // Filter by kitchen so the storefront can show one kitchen at a time
        if (kitchen && kitchen !== 'all') {
            query.kitchen = kitchen;
        }
        
        // Filter by availability
        if (available === 'all') {
            // Don't filter by availability - show all meals (for admin)
        } else if (available !== undefined) {
            query.isAvailable = available === 'true';
        } else {
            query.isAvailable = true; // By default, show only available meals
        }
        
        // Search by name or description
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Sorting
        let sortOption = { createdAt: -1 };
        if (sort === 'price_low') sortOption = { price: 1 };
        if (sort === 'price_high') sortOption = { price: -1 };
        if (sort === 'rating') sortOption = { 'ratings.average': -1 };
        if (sort === 'name') sortOption = { name: 1 };
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [meals, total] = await Promise.all([
            Meal.find(query)
                .sort(sortOption)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('kitchen', KITCHEN_PUBLIC_FIELDS)
                .populate('createdBy', 'name email role phone')
                .populate('updatedBy', 'name email role phone'),
            Meal.countDocuments(query)
        ]);
        
        res.json({
            success: true,
            data: meals,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching meals:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get single meal (public)
export const getMealById = async (req, res) => {
    try {
        const meal = await Meal.findById(req.params.id)
            .populate('kitchen', KITCHEN_PUBLIC_FIELDS)
            .populate('createdBy', 'name email role phone')
            .populate('updatedBy', 'name email role phone');
        
        if (!meal) {
            return res.status(404).json({ success: false, message: 'Meal not found' });
        }
        
        res.json({ success: true, data: meal });
    } catch (error) {
        console.error('Error fetching meal:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Resolve which kitchen an admin write should apply to.
// A normal admin is locked to their own kitchen; a super_admin must name one.
const resolveKitchenForWrite = async (req) => {
    if (req.userRole === 'super_admin') {
        const kitchenId = req.body.kitchen || req.kitchenId;
        if (!kitchenId) {
            return { error: 'A kitchen is required. Pass "kitchen" in the request body.' };
        }
        const kitchen = await Kitchen.findById(kitchenId).select('_id');
        if (!kitchen) {
            return { error: 'Kitchen not found' };
        }
        return { kitchenId: kitchen._id.toString() };
    }

    if (!req.kitchenId) {
        return { error: 'Your admin account is not linked to a kitchen' };
    }
    return { kitchenId: req.kitchenId };
};

// Create meal (admin only)
export const createMeal = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            images,
            preparationTime,
            servingSize,
            nutritionInfo,
            tags
        } = req.body;
        
        const { kitchenId, error } = await resolveKitchenForWrite(req);
        if (error) {
            return res.status(400).json({ success: false, message: error });
        }
        
        const meal = new Meal({
            name,
            description,
            price,
            category,
            images: images || [],
            preparationTime,
            servingSize,
            nutritionInfo,
            tags: tags || [],
            kitchen: kitchenId,
            createdBy: req.userId,
            updatedBy: req.userId
        });
        
        await meal.save();
        
        // Populate creator info before sending response
        await meal.populate('kitchen', KITCHEN_PUBLIC_FIELDS);
        await meal.populate('createdBy', 'name email role phone');
        
        res.status(201).json({
            success: true,
            message: 'Meal created successfully',
            data: meal
        });
    } catch (error) {
        console.error('Error creating meal:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reject writes by an admin against another kitchen's meal
const denyCrossKitchenMeal = (req, meal) => {
    if (req.userRole === 'super_admin') return false;
    return meal.kitchen?.toString() !== req.kitchenId;
};

// Update meal (admin only)
export const updateMeal = async (req, res) => {
    try {
        const existing = await Meal.findById(req.params.id).select('kitchen');
        
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Meal not found' });
        }
        
        if (denyCrossKitchenMeal(req, existing)) {
            return res.status(403).json({
                success: false,
                message: 'You can only manage meals from your own kitchen'
            });
        }
        
        const updates = { ...req.body, updatedBy: req.userId };
        // Only a super_admin may move a meal between kitchens
        if (req.userRole !== 'super_admin') {
            delete updates.kitchen;
        }
        
        const meal = await Meal.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).populate('kitchen', KITCHEN_PUBLIC_FIELDS)
         .populate('createdBy', 'name email role phone')
         .populate('updatedBy', 'name email role phone');
        
        res.json({
            success: true,
            message: 'Meal updated successfully',
            data: meal
        });
    } catch (error) {
        console.error('Error updating meal:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete meal (admin only)
export const deleteMeal = async (req, res) => {
    try {
        const meal = await Meal.findById(req.params.id).select('kitchen');
        
        if (!meal) {
            return res.status(404).json({ success: false, message: 'Meal not found' });
        }
        
        if (denyCrossKitchenMeal(req, meal)) {
            return res.status(403).json({
                success: false,
                message: 'You can only manage meals from your own kitchen'
            });
        }
        
        await Meal.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'Meal deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting meal:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Toggle meal availability (admin only)
export const toggleAvailability = async (req, res) => {
    try {
        const meal = await Meal.findById(req.params.id);
        
        if (!meal) {
            return res.status(404).json({ success: false, message: 'Meal not found' });
        }
        
        if (denyCrossKitchenMeal(req, meal)) {
            return res.status(403).json({
                success: false,
                message: 'You can only manage meals from your own kitchen'
            });
        }
        
        meal.isAvailable = !meal.isAvailable;
        await meal.save();
        
        res.json({
            success: true,
            message: `Meal ${meal.isAvailable ? 'enabled' : 'disabled'} successfully`,
            data: meal
        });
    } catch (error) {
        console.error('Error toggling availability:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get featured/popular meals
export const getFeaturedMeals = async (req, res) => {
    try {
        const { kitchen } = req.query;
        
        const query = { isAvailable: true };
        if (kitchen && kitchen !== 'all') {
            query.kitchen = kitchen;
        }
        
        const meals = await Meal.find(query)
            .sort({ 'ratings.average': -1, 'ratings.count': -1 })
            .limit(6)
            .populate('kitchen', KITCHEN_PUBLIC_FIELDS);
        
        res.json({ success: true, data: meals });
    } catch (error) {
        console.error('Error fetching featured meals:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get meals by category
export const getMealsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { kitchen } = req.query;
        
        const query = { category, isAvailable: true };
        if (kitchen && kitchen !== 'all') {
            query.kitchen = kitchen;
        }
        
        const meals = await Meal.find(query)
            .sort({ createdAt: -1 })
            .populate('kitchen', KITCHEN_PUBLIC_FIELDS);
        
        res.json({ success: true, data: meals });
    } catch (error) {
        console.error('Error fetching meals by category:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
