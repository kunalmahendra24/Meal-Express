import mongoose from "mongoose";

const kitchenSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Kitchen name is required'],
        trim: true,
        maxlength: [100, 'Kitchen name cannot exceed 100 characters']
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'Kitchen owner is required']
    },
    phone: {
        type: String,
        trim: true
    },
    upiId: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

kitchenSchema.index({ owner: 1 });

const Kitchen = mongoose.models.Kitchen || mongoose.model('Kitchen', kitchenSchema);
export default Kitchen;
