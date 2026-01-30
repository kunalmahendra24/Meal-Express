import Settings from '../models/settingsModel.js';

// Get public settings (owner phone, call feature status, UPI, etc.)
export const getPublicSettings = async (req, res) => {
    try {
        const callEnabled = await Settings.getSetting('call_owner_enabled', true);
        const ownerPhone = await Settings.getSetting('owner_phone', '');
        const businessName = await Settings.getSetting('business_name', 'Meal Express');
        const deliveryCharge = await Settings.getSetting('delivery_charge', 30);
        const freeDeliveryAbove = await Settings.getSetting('free_delivery_above', 500);
        const minOrderAmount = await Settings.getSetting('minimum_order_amount', 100);
        const upiId = await Settings.getSetting('upi_id', '');
        const upiName = await Settings.getSetting('upi_name', 'Meal Express');
        
        res.json({
            success: true,
            data: {
                callOwnerEnabled: callEnabled,
                ownerPhone: callEnabled ? ownerPhone : null,
                businessName,
                deliveryCharge,
                freeDeliveryAbove,
                minOrderAmount,
                upiId,
                upiName
            }
        });
    } catch (error) {
        console.error('Error fetching public settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get owner phone (for Call Owner feature)
export const getOwnerPhone = async (req, res) => {
    try {
        const callEnabled = await Settings.getSetting('call_owner_enabled', true);
        
        if (!callEnabled) {
            return res.status(403).json({ 
                success: false, 
                message: 'Call feature is currently disabled' 
            });
        }
        
        const ownerPhone = await Settings.getSetting('owner_phone', '');
        
        res.json({
            success: true,
            data: { phone: ownerPhone }
        });
    } catch (error) {
        console.error('Error fetching owner phone:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ============ ADMIN FUNCTIONS ============

// Get all settings (admin)
export const getAllSettings = async (req, res) => {
    try {
        const settings = await Settings.find().sort({ key: 1 });
        
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update setting (admin)
export const updateSetting = async (req, res) => {
    try {
        const { key, value, description } = req.body;
        
        if (!key) {
            return res.status(400).json({ success: false, message: 'Setting key is required' });
        }
        
        const setting = await Settings.setSetting(key, value, description, req.userId);
        
        res.json({
            success: true,
            message: 'Setting updated successfully',
            data: setting
        });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update owner phone (admin)
export const updateOwnerPhone = async (req, res) => {
    try {
        const { phone } = req.body;
        
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number is required' });
        }
        
        const setting = await Settings.setSetting(
            'owner_phone', 
            phone, 
            'Owner contact phone number', 
            req.userId
        );
        
        res.json({
            success: true,
            message: 'Owner phone updated successfully',
            data: setting
        });
    } catch (error) {
        console.error('Error updating owner phone:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Toggle call owner feature (admin)
export const toggleCallOwner = async (req, res) => {
    try {
        const currentValue = await Settings.getSetting('call_owner_enabled', true);
        
        const setting = await Settings.setSetting(
            'call_owner_enabled', 
            !currentValue, 
            'Enable/disable Call Owner feature', 
            req.userId
        );
        
        res.json({
            success: true,
            message: `Call Owner feature ${!currentValue ? 'enabled' : 'disabled'}`,
            data: setting
        });
    } catch (error) {
        console.error('Error toggling call owner:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Initialize default settings
export const initializeSettings = async (req, res) => {
    try {
        await Settings.initializeDefaults();
        
        res.json({
            success: true,
            message: 'Settings initialized successfully'
        });
    } catch (error) {
        console.error('Error initializing settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
