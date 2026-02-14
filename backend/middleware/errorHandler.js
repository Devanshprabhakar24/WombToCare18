/**
 * Custom Error Classes
 */

export class ValidationError extends Error {
    constructor(message, fields = []) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
        this.code = 'VALIDATION_ERROR';
        this.fields = fields;
    }
}

export class AuthenticationError extends Error {
    constructor(message = 'Authentication failed') {
        super(message);
        this.name = 'AuthenticationError';
        this.statusCode = 401;
        this.code = 'AUTHENTICATION_ERROR';
    }
}

export class AuthorizationError extends Error {
    constructor(message = 'Access denied') {
        super(message);
        this.name = 'AuthorizationError';
        this.statusCode = 403;
        this.code = 'AUTHORIZATION_ERROR';
    }
}

export class NotFoundError extends Error {
    constructor(resource = 'Resource') {
        super(`${resource} not found`);
        this.name = 'NotFoundError';
        this.statusCode = 404;
        this.code = 'NOT_FOUND';
    }
}

export class PaymentError extends Error {
    constructor(message = 'Payment processing failed') {
        super(message);
        this.name = 'PaymentError';
        this.statusCode = 400;
        this.code = 'PAYMENT_ERROR';
    }
}

export class ConflictError extends Error {
    constructor(message = 'Resource already exists') {
        super(message);
        this.name = 'ConflictError';
        this.statusCode = 409;
        this.code = 'CONFLICT_ERROR';
    }
}

export class BadGatewayError extends Error {
    constructor(message = 'External service error') {
        super(message);
        this.name = 'BadGatewayError';
        this.statusCode = 502;
        this.code = 'BAD_GATEWAY';
    }
}

export class ServiceUnavailableError extends Error {
    constructor(message = 'Service temporarily unavailable') {
        super(message);
        this.name = 'ServiceUnavailableError';
        this.statusCode = 503;
        this.code = 'SERVICE_UNAVAILABLE';
    }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
    // Log error with context
    const errorLog = {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        userId: req.user?.userId || 'anonymous',
        timestamp: new Date().toISOString(),
        body: req.body,
    };

    console.error('Error occurred:', errorLog);

    // Determine status code
    const statusCode = err.statusCode || 500;

    // Build error response
    const errorResponse = {
        error: {
            message: err.message || 'Internal server error',
            code: err.code || 'INTERNAL_ERROR',
            timestamp: new Date().toISOString(),
        },
    };

    // Add fields for validation errors
    if (err.fields) {
        errorResponse.error.fields = err.fields;
    }

    // Don't expose internal error details in production
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        errorResponse.error.message = 'An unexpected error occurred';
        delete errorResponse.error.stack;
    } else if (process.env.NODE_ENV !== 'production') {
        // Include stack trace in development
        errorResponse.error.stack = err.stack;
    }

    // Handle specific error types
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        if (err.code === 11000) {
            // Duplicate key error
            errorResponse.error.message = 'A record with this information already exists';
            errorResponse.error.code = 'DUPLICATE_ERROR';
            return res.status(409).json(errorResponse);
        }
    }

    if (err.name === 'CastError') {
        errorResponse.error.message = 'Invalid ID format';
        errorResponse.error.code = 'INVALID_ID';
        return res.status(400).json(errorResponse);
    }

    if (err.name === 'JsonWebTokenError') {
        errorResponse.error.message = 'Invalid token';
        errorResponse.error.code = 'INVALID_TOKEN';
        return res.status(401).json(errorResponse);
    }

    if (err.name === 'TokenExpiredError') {
        errorResponse.error.message = 'Token has expired';
        errorResponse.error.code = 'TOKEN_EXPIRED';
        return res.status(401).json(errorResponse);
    }

    // Send error response
    res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: {
            message: `Route ${req.originalUrl} not found`,
            code: 'ROUTE_NOT_FOUND',
            timestamp: new Date().toISOString(),
        },
    });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
