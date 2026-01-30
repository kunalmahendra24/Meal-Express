// Simple in-memory rate limiter
const requestCounts = new Map();

const rateLimiter = (options = {}) => {
    const {
        windowMs = 60 * 1000, // 1 minute
        max = 100, // Max requests per window
        message = 'Too many requests, please try again later.'
    } = options;

    // Cleanup old entries periodically
    setInterval(() => {
        const now = Date.now();
        for (const [key, data] of requestCounts.entries()) {
            if (now - data.startTime > windowMs) {
                requestCounts.delete(key);
            }
        }
    }, windowMs);

    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        if (!requestCounts.has(key)) {
            requestCounts.set(key, {
                count: 1,
                startTime: now
            });
            return next();
        }

        const data = requestCounts.get(key);

        // Reset if window has passed
        if (now - data.startTime > windowMs) {
            requestCounts.set(key, {
                count: 1,
                startTime: now
            });
            return next();
        }

        // Increment count
        data.count++;

        if (data.count > max) {
            return res.status(429).json({
                success: false,
                message: message
            });
        }

        next();
    };
};

// Specific rate limiters
export const apiLimiter = rateLimiter({
    windowMs: 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again after a minute.'
});

export const authLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: 'Too many authentication attempts, please try again after 15 minutes.'
});

export const orderLimiter = rateLimiter({
    windowMs: 60 * 1000,
    max: 10,
    message: 'Too many order requests, please try again later.'
});

export default rateLimiter;
