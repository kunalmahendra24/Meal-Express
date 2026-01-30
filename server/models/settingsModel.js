import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    description: {
        type: String
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
}, { timestamps: true });

// Static method to get a setting
settingsSchema.statics.getSetting = async function(key, defaultValue = null) {
    const setting = await this.findOne({ key });
    return setting ? setting.value : defaultValue;
};

// Static method to set a setting
settingsSchema.statics.setSetting = async function(key, value, description = '', userId = null) {
    const setting = await this.findOneAndUpdate(
        { key },
        { 
            value, 
            description,
            updatedBy: userId 
        },
        { upsert: true, new: true }
    );
    return setting;
};

// Initialize default settings
settingsSchema.statics.initializeDefaults = async function() {
    const defaults = [
        {
            key: 'owner_phone',
            value: '+91 9876543210',
            description: 'Owner contact phone number for customers'
        },
        {
            key: 'call_owner_enabled',
            value: true,
            description: 'Enable/disable Call Owner feature'
        },
        {
            key: 'business_name',
            value: 'Meal Express',
            description: 'Business name displayed on the platform'
        },
        {
            key: 'business_email',
            value: 'contact@mealexpress.com',
            description: 'Business contact email'
        },
        {
            key: 'delivery_hours',
            value: {
                start: '11:00',
                end: '21:00'
            },
            description: 'Delivery operating hours'
        },
        {
            key: 'minimum_order_amount',
            value: 100,
            description: 'Minimum order amount in rupees'
        },
        {
            key: 'delivery_charge',
            value: 30,
            description: 'Delivery charge in rupees'
        },
        {
            key: 'free_delivery_above',
            value: 500,
            description: 'Free delivery for orders above this amount'
        },
        {
            key: 'upi_id',
            value: '',
            description: 'UPI ID for receiving payments'
        },
        {
            key: 'upi_name',
            value: 'Meal Express',
            description: 'Name displayed for UPI payment'
        }
    ];

    for (const setting of defaults) {
        await this.findOneAndUpdate(
            { key: setting.key },
            setting,
            { upsert: true }
        );
    }
};

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
export default Settings;
