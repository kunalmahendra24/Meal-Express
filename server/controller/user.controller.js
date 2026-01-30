import userModel from '../models/userModel.js';
import Meal from '../models/mealModel.js';

// Get user data
export const getUserData = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }
        
        const user = await userModel.findById(userId)
            .select('-password -verifyOtp -resetOtp -verifyOtpExpireAt -resetOtpExpireAt');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { name, phone, avatar } = req.body;
        
        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (avatar) updateData.avatar = avatar;
        
        const user = await userModel.findByIdAndUpdate(
            req.userId,
            { $set: updateData },
            { new: true }
        ).select('-password -verifyOtp -resetOtp');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Add new address
export const addAddress = async (req, res) => {
    try {
        const { label, fullName, phone, addressLine1, addressLine2, city, state, pincode, landmark, isDefault } = req.body;
        
        if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
            return res.status(400).json({ success: false, message: 'Required address fields missing' });
        }
        
        const user = await userModel.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // If this is the first address or isDefault is true, set as default
        if (isDefault || user.addresses.length === 0) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }
        
        user.addresses.push({
            label: label || 'Home',
            fullName,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            landmark,
            isDefault: isDefault || user.addresses.length === 0
        });
        
        await user.save();
        
        res.json({
            success: true,
            message: 'Address added successfully',
            data: user.addresses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Update address
export const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const updateData = req.body;
        
        const user = await userModel.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
        
        if (addressIndex === -1) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }
        
        // If setting as default, unset others
        if (updateData.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }
        
        Object.assign(user.addresses[addressIndex], updateData);
        await user.save();
        
        res.json({
            success: true,
            message: 'Address updated successfully',
            data: user.addresses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Delete address
export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        
        const user = await userModel.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
        
        if (addressIndex === -1) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }
        
        const wasDefault = user.addresses[addressIndex].isDefault;
        user.addresses.splice(addressIndex, 1);
        
        // If deleted address was default, set first address as default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }
        
        await user.save();
        
        res.json({
            success: true,
            message: 'Address deleted successfully',
            data: user.addresses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get user addresses
export const getAddresses = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId).select('addresses');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({
            success: true,
            data: user.addresses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Add to favorites
export const addToFavorites = async (req, res) => {
    try {
        const { mealId } = req.params;
        
        const meal = await Meal.findById(mealId);
        if (!meal) {
            return res.status(404).json({ success: false, message: 'Meal not found' });
        }
        
        const user = await userModel.findById(req.userId);
        
        if (user.favorites.includes(mealId)) {
            return res.status(400).json({ success: false, message: 'Already in favorites' });
        }
        
        user.favorites.push(mealId);
        await user.save();
        
        res.json({
            success: true,
            message: 'Added to favorites',
            data: user.favorites
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Remove from favorites
export const removeFromFavorites = async (req, res) => {
    try {
        const { mealId } = req.params;
        
        const user = await userModel.findById(req.userId);
        
        const index = user.favorites.indexOf(mealId);
        if (index === -1) {
            return res.status(400).json({ success: false, message: 'Not in favorites' });
        }
        
        user.favorites.splice(index, 1);
        await user.save();
        
        res.json({
            success: true,
            message: 'Removed from favorites',
            data: user.favorites
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get favorites
export const getFavorites = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId)
            .populate('favorites', 'name price images category isAvailable');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({
            success: true,
            data: user.favorites
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
