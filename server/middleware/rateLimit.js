import rateLimit from 'express-rate-limit';

// Credential and OTP endpoints are the brute-force / email-flood surface, so they get a tight budget
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many attempts. Please try again in a few minutes.'
    }
});

// Loose backstop for other write traffic; public read routes such as meal browsing stay unlimited
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please slow down and try again.'
    }
});
