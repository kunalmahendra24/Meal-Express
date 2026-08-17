/**
 * One-off migration: move single-kitchen data onto the multi-kitchen model.
 *
 *   1. Creates a default Kitchen from the current Settings, owned by the first super_admin.
 *   2. Backfills every meal and order that has no kitchen.
 *   3. Points existing `admin` users at the default kitchen.
 *
 * Safe to re-run: it reuses the existing default kitchen and only touches
 * documents that are still missing a kitchen.
 *
 * Usage:  npm run migrate:kitchens        (from the server directory)
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/mongodb.js';
import Kitchen from '../models/kitchenModel.js';
import Meal from '../models/mealModel.js';
import Order from '../models/orderModel.js';
import Settings from '../models/settingsModel.js';
import userModel from '../models/userModel.js';

dotenv.config({ quiet: true });

const missingKitchen = { $or: [{ kitchen: { $exists: false } }, { kitchen: null }] };

const run = async () => {
    await connectDB();

    const [businessName, ownerPhone, upiId] = await Promise.all([
        Settings.getSetting('business_name', 'Meal Express'),
        Settings.getSetting('owner_phone', ''),
        Settings.getSetting('upi_id', '')
    ]);

    const superAdmin = await userModel.findOne({ role: 'super_admin' }).sort({ createdAt: 1 });
    if (!superAdmin) {
        throw new Error('No super_admin user found. Create one before running this migration.');
    }

    let kitchen = await Kitchen.findOne({ name: businessName });
    if (!kitchen) {
        kitchen = await Kitchen.create({
            name: businessName,
            owner: superAdmin._id,
            phone: ownerPhone,
            upiId,
            isActive: true
        });
        console.log(`Created default kitchen "${kitchen.name}" (${kitchen._id})`);
    } else {
        console.log(`Reusing existing kitchen "${kitchen.name}" (${kitchen._id})`);
    }

    const [meals, orders, admins] = await Promise.all([
        Meal.updateMany(missingKitchen, { $set: { kitchen: kitchen._id } }),
        Order.updateMany(missingKitchen, { $set: { kitchen: kitchen._id } }),
        userModel.updateMany(
            { role: 'admin', ...missingKitchen },
            { $set: { kitchen: kitchen._id } }
        )
    ]);

    console.log(`Backfilled ${meals.modifiedCount} meal(s)`);
    console.log(`Backfilled ${orders.modifiedCount} order(s)`);
    console.log(`Linked ${admins.modifiedCount} admin user(s) to the kitchen`);
    console.log('Migration complete.');
};

run()
    .catch((error) => {
        console.error('Migration failed:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.connection.close();
    });
