// Rate limiter
import rateLimit from 'express-rate-limit';

// Auth rate limiter
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: process.env.NODE_ENV === 'production' ? 5 : 100, // prod/dev
    message: {
        error: {
            message: 'Too many authentication attempts, please try again after 15 minutes',
            code: 'RATE_LIMIT_EXCEEDED',
            timestamp: new Date().toISOString(),
        },
    },
    standardHeaders: true, // RateLimit-*
    legacyHeaders: false, // No X-RateLimit
    handler: (req, res) => {
        res.status(429).json({
            error: {
                message: 'Too many authentication attempts, please try again after 15 minutes',
                code: 'RATE_LIMIT_EXCEEDED',
                timestamp: new Date().toISOString(),
            },
        });
    },
    // Skip in dev
    skip: (req) => process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true',
});

// API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // prod/dev
    message: {
        error: {
            message: 'Too many requests, please try again later',
            code: 'RATE_LIMIT_EXCEEDED',
            timestamp: new Date().toISOString(),
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip in dev
    skip: (req) => process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true',
});
