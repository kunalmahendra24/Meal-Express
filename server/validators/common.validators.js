import { z } from 'zod';

// A bad id would otherwise surface as a Mongoose CastError 500 instead of a 400
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

// Matches the required fields on the embedded deliveryAddress in the order model
export const deliveryAddressSchema = z.object({
    fullName: z.string().trim().min(1, 'Full name is required'),
    phone: z.string().trim().min(1, 'Phone is required'),
    addressLine1: z.string().trim().min(1, 'Address line 1 is required'),
    addressLine2: z.string().nullish(),
    city: z.string().trim().min(1, 'City is required'),
    state: z.string().trim().min(1, 'State is required'),
    pincode: z.string().trim().min(1, 'Pincode is required'),
    landmark: z.string().nullish()
});
