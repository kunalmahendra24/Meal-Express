import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    meal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meal',
        required: true
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    // An order is always fulfilled by exactly one kitchen (enforced in createOrder)
    kitchen: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Kitchen',
        required: [true, 'Kitchen is required']
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
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
        enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    statusHistory: [{
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        note: { type: String }
    }],
    paymentMethod: {
        type: String,
        enum: ['cod', 'online', 'upi'],
        default: 'cod'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    deliveryInstructions: {
        type: String,
        maxlength: 200
    },
    estimatedDeliveryTime: {
        type: Date
    },
    actualDeliveryTime: {
        type: Date
    },
    // Set from the Idempotency-Key header so a retried submit cannot create a second order
    idempotencyKey: {
        type: String
    }
}, { timestamps: true });

// Index for queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ kitchen: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Partial so only key-carrying orders are indexed; existing orders without a key are untouched
orderSchema.index(
    { user: 1, idempotencyKey: 1 },
    { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } }
);

// Pre-save hook to add status to history without duplicating
orderSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        const last = this.statusHistory[this.statusHistory.length - 1];
        if (!last || last.status !== this.status) {
            this.statusHistory.push({
                status: this.status,
                timestamp: new Date()
            });
        }
    }
    next();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
