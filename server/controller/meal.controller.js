import Meal from '../models/mealModel.js';

// Get all meals (public)
export const getAllMeals = async (req, res) => {
    try {
        const { category, search, sort, page = 1, limit = 12, available } = req.query;
        
        const query = {};
        
        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
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
            tags,
            weeklyPrice,
            monthlyPrice
        } = req.body;
        
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
            weeklyPrice,
            monthlyPrice,
            createdBy: req.userId,
            updatedBy: req.userId
        });
        
        await meal.save();
        
        // Populate creator info before sending response
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

// Update meal (admin only)
export const updateMeal = async (req, res) => {
    try {
        const meal = await Meal.findByIdAndUpdate(
            req.params.id,
            { 
                $set: {
                    ...req.body,
                    updatedBy: req.userId
                }
            },
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email role phone')
         .populate('updatedBy', 'name email role phone');
        
        if (!meal) {
            return res.status(404).json({ success: false, message: 'Meal not found' });
        }
        
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
        const meal = await Meal.findByIdAndDelete(req.params.id);
        
        if (!meal) {
            return res.status(404).json({ success: false, message: 'Meal not found' });
        }
        
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
        const meals = await Meal.find({ isAvailable: true })
            .sort({ 'ratings.average': -1, 'ratings.count': -1 })
            .limit(6);
        
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
        
        const meals = await Meal.find({ 
            category, 
            isAvailable: true 
        }).sort({ createdAt: -1 });
        
        res.json({ success: true, data: meals });
    } catch (error) {
        console.error('Error fetching meals by category:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
