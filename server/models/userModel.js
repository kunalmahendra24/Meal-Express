import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    label: {
        type: String,
        default: 'Home'
    },
    fullName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    addressLine1: {
        type: String,
        required: true
    },
    addressLine2: {
        type: String
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    landmark: {
        type: String
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, { _id: true });

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'super_admin'],
        default: 'user'
    },
    addresses: [addressSchema],
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meal'
    }],
    verifyOtp: {
        type: String,
        default: '',     
    },
    verifyOtpExpireAt: {
        type: Number,
        default: 0,
    },
    isAccountVerified: {
        type: Boolean,
        default: false,
    },  
    resetOtp: {
        type: String,
        default: '',        
    },
    resetOtpExpireAt: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, { timestamps: true });

userSchema.index({ role: 1 });

userSchema.set('toJSON', {
    transform: function (_doc, ret) {
        delete ret.password;
        delete ret.verifyOtp;
        delete ret.verifyOtpExpireAt;
        delete ret.resetOtp;
        delete ret.resetOtpExpireAt;
        return ret;
    }
});

const userModel = mongoose.models.user || mongoose.model('user', userSchema);
export default userModel;
