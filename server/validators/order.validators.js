import { z } from 'zod';
import { deliveryAddressSchema, objectIdSchema } from './common.validators.js';

export const createOrderSchema = z.object({
    items: z.array(z.object({
        mealId: objectIdSchema,
        // Prices are recomputed server-side, so quantity is the only client number that matters
        quantity: z.number().int('Quantity must be a whole number').positive('Quantity must be at least 1')
    })).min(1, 'No items in order'),
    deliveryAddress: deliveryAddressSchema,
    paymentMethod: z.enum(['cod', 'online', 'upi']).optional(),
    deliveryInstructions: z.string().max(200, 'Delivery instructions are too long').nullish()
});
