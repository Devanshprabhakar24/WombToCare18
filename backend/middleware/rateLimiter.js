import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication endpoints
 * Prevents brute force attacks
 * More lenient in development mode
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 5 : 100, // 5 in production, 100 in development
    message: {
        error: {
            message: 'Too many authentication attempts, please try again after 15 minutes',
            code: 'RATE_LIMIT_EXCEEDED',
            timestamp: new Date().toISOString(),
        },
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(429).json({
            error: {
                message: 'Too many authentication attempts, please try again after 15 minutes',
                code: 'RATE_LIMIT_EXCEEDED',
                timestamp: new Date().toISOString(),
            },
        });
    },
    // Skip rate limiting in development if needed
    skip: (req) => process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true',
});

/**
 * General API rate limiter
 * Prevents API abuse
 * More lenient in development mode
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 100 in production, 1000 in development
    message: {
        error: {
            message: 'Too many requests, please try again later',
            code: 'RATE_LIMIT_EXCEEDED',
            timestamp: new Date().toISOString(),
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting in development if needed
    skip: (req) => process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true',
});
