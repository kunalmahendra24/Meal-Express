import { z } from 'zod';
import { deliveryAddressSchema, objectIdSchema } from './common.validators.js';

const deliveryDaySchema = z.enum([
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
]);

export const createSubscriptionSchema = z.object({
    mealId: objectIdSchema,
    planType: z.enum(['weekly', 'monthly']),
    deliveryTime: z.string().trim().min(1, 'Delivery time is required'),
    deliveryDays: z.array(deliveryDaySchema).min(1, 'At least one delivery day is required').optional(),
    deliveryAddress: deliveryAddressSchema,
    // The controller derives endDate from this, so an unparseable date must not get through
    startDate: z.coerce.date({ message: 'A valid start date is required' })
});
