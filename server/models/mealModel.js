import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Meal name is required'],
        trim: true,
        maxlength: [100, 'Meal name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Meal description is required'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['veg', 'non-veg', 'jain'],
        default: 'veg'
    },
    images: [{
        type: String
    }],
    isAvailable: {
        type: Boolean,
        default: true
    },
    preparationTime: {
        type: Number, // in minutes
        default: 30
    },
    servingSize: {
        type: String,
        default: '1 person'
    },
    nutritionInfo: {
        calories: { type: Number },
        protein: { type: String },
        carbs: { type: String }
    },
    tags: [{
        type: String,
        trim: true
    }],
    ratings: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    // Subscription pricing
    weeklyPrice: {
        type: Number,
        min: [0, 'Weekly price cannot be negative']
    },
    monthlyPrice: {
        type: Number,
        min: [0, 'Monthly price cannot be negative']
    },
    // Admin attribution - track who created/updated the meal
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
}, { timestamps: true });

// Index for searching
mealSchema.index({ name: 'text', description: 'text', tags: 'text' });
mealSchema.index({ category: 1, isAvailable: 1 });

const Meal = mongoose.models.Meal || mongoose.model('Meal', mealSchema);
export default Meal;
