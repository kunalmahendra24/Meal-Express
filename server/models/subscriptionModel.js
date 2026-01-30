import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    meal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meal',
        required: true
    },
    planType: {
        type: String,
        enum: ['weekly', 'monthly'],
        required: true
    },
    pricePerDay: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    deliveryTime: {
        type: String, // e.g., "12:00 PM - 1:00 PM"
        required: true
    },
    deliveryDays: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    deliveryAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        landmark: { type: String }
    },
    status: {
        type: String,
        enum: ['active', 'paused', 'cancelled', 'completed', 'expired'],
        default: 'active'
    },
    pausedDates: [{
        type: Date
    }],
    deliveryHistory: [{
        date: { type: Date },
        status: { type: String, enum: ['delivered', 'skipped', 'cancelled'] },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
    }],
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    autoRenew: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Index for queries
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ status: 1, startDate: 1 });

const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
