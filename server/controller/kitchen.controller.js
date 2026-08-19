import Kitchen from '../models/kitchenModel.js';
import Meal from '../models/mealModel.js';
import userModel from '../models/userModel.js';
import { disconnectUserSockets } from '../socket/emit.js';

// Get all kitchens (public - storefront browses by kitchen)
export const getAllKitchens = async (req, res) => {
    try {
        const kitchens = await Kitchen.find({ isActive: true })
            .select('name phone upiId isActive')
            .sort({ name: 1 });

        res.json({ success: true, data: kitchens });
    } catch (error) {
        console.error('Error fetching kitchens:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get single kitchen with its meal count (public)
export const getKitchenById = async (req, res) => {
    try {
        const kitchen = await Kitchen.findById(req.params.id)
            .select('name phone upiId isActive');

        if (!kitchen) {
            return res.status(404).json({ success: false, message: 'Kitchen not found' });
        }

        const mealCount = await Meal.countDocuments({ kitchen: kitchen._id, isAvailable: true });

        res.json({ success: true, data: { ...kitchen.toObject(), mealCount } });
    } catch (error) {
        console.error('Error fetching kitchen:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ============ ADMIN FUNCTIONS ============

// Get kitchens visible to the requesting admin (admin sees only their own)
export const getAdminKitchens = async (req, res) => {
    try {
        const query = req.userRole === 'super_admin'
            ? {}
            : { _id: req.kitchenId || null };

        const kitchens = await Kitchen.find(query)
            .populate('owner', 'name email phone')
            .sort({ createdAt: -1 });

        const withStaff = await Promise.all(kitchens.map(async (kitchen) => {
            const staff = await userModel
                .find({ kitchen: kitchen._id })
                .select('name email role');
            return { ...kitchen.toObject(), staff };
        }));

        res.json({ success: true, data: withStaff });
    } catch (error) {
        console.error('Error fetching admin kitchens:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const ONE_KITCHEN_ONLY = 'You already run a kitchen, and an admin can only have one';

// Create kitchen (super admin for anyone, or an admin setting up their own single kitchen)
export const createKitchen = async (req, res) => {
    try {
        const { name, owner, phone, upiId, isActive } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Kitchen name is required' });
        }

        const isSuperAdmin = req.userRole === 'super_admin';

        if (!isSuperAdmin) {
            // Cheap pre-check so the common case fails before anything is written
            if (req.kitchenId) {
                return res.status(403).json({ success: false, message: ONE_KITCHEN_ONLY });
            }
            if (owner && owner !== req.userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only create a kitchen for yourself'
                });
            }
        }

        // Default the owner to the creating admin when none is given
        const ownerId = isSuperAdmin ? (owner || req.userId) : req.userId;
        const ownerUser = await userModel.findById(ownerId).select('_id role');
        if (!ownerUser) {
            return res.status(404).json({ success: false, message: 'Owner user not found' });
        }

        const kitchen = await Kitchen.create({
            name,
            owner: ownerId,
            phone,
            upiId,
            isActive: isActive !== undefined ? isActive : true
        });

        // A super_admin stays cross-kitchen; an admin is bound to the one they just created.
        // The null guard is what actually enforces "only one" when two requests race.
        if (!isSuperAdmin) {
            const claimed = await userModel.findOneAndUpdate(
                { _id: req.userId, kitchen: null },
                { kitchen: kitchen._id }
            );

            if (!claimed) {
                await Kitchen.findByIdAndDelete(kitchen._id);
                return res.status(403).json({ success: false, message: ONE_KITCHEN_ONLY });
            }
        }

        await kitchen.populate('owner', 'name email phone');

        res.status(201).json({
            success: true,
            message: 'Kitchen created successfully',
            data: kitchen
        });
    } catch (error) {
        console.error('Error creating kitchen:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update kitchen (super admin, or an admin editing their own kitchen)
export const updateKitchen = async (req, res) => {
    try {
        if (req.userRole !== 'super_admin' && req.params.id !== req.kitchenId) {
            return res.status(403).json({
                success: false,
                message: 'You can only manage your own kitchen'
            });
        }

        const updates = { ...req.body };
        // Ownership transfers are a super_admin action only
        if (req.userRole !== 'super_admin') {
            delete updates.owner;
        }

        const kitchen = await Kitchen.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).populate('owner', 'name email phone');

        if (!kitchen) {
            return res.status(404).json({ success: false, message: 'Kitchen not found' });
        }

        res.json({
            success: true,
            message: 'Kitchen updated successfully',
            data: kitchen
        });
    } catch (error) {
        console.error('Error updating kitchen:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Attach or detach an admin user from a kitchen (super admin)
export const setKitchenStaff = async (req, res) => {
    try {
        const { userId, action = 'add' } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'userId is required' });
        }

        const kitchen = await Kitchen.findById(req.params.id).select('_id');
        if (!kitchen) {
            return res.status(404).json({ success: false, message: 'Kitchen not found' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === 'super_admin') {
            return res.status(400).json({
                success: false,
                message: 'A super admin is cross-kitchen and cannot be assigned to one'
            });
        }

        if (action === 'remove') {
            user.kitchen = null;
            // Unstaffing mirrors staffing: without a kitchen an admin has nothing left to manage,
            // so the privilege goes with it rather than lingering as kitchen-less admin access
            if (user.role === 'admin') {
                user.role = 'user';
            }
        } else {
            user.kitchen = kitchen._id;
            // Staffing a kitchen implies admin privileges
            if (user.role === 'user') {
                user.role = 'admin';
            }
        }

        await user.save();

        disconnectUserSockets(req.app.get('io'), user._id);

        res.json({
            success: true,
            message: action === 'remove' ? 'Admin removed from kitchen' : 'Admin assigned to kitchen',
            data: { _id: user._id, name: user.name, email: user.email, role: user.role, kitchen: user.kitchen }
        });
    } catch (error) {
        console.error('Error updating kitchen staff:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete kitchen (super admin) - refuses while meals still reference it
export const deleteKitchen = async (req, res) => {
    try {
        const kitchen = await Kitchen.findById(req.params.id).select('_id');
        if (!kitchen) {
            return res.status(404).json({ success: false, message: 'Kitchen not found' });
        }

        const mealCount = await Meal.countDocuments({ kitchen: kitchen._id });
        if (mealCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete a kitchen with ${mealCount} meal(s). Move or delete them first.`
            });
        }

        await userModel.updateMany({ kitchen: kitchen._id }, { $set: { kitchen: null } });
        await Kitchen.findByIdAndDelete(kitchen._id);

        res.json({ success: true, message: 'Kitchen deleted successfully' });
    } catch (error) {
        console.error('Error deleting kitchen:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
