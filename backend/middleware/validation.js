import { body, param, query, validationResult } from 'express-validator';

/**
 * Validation middleware to check for validation errors
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: {
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                fields: errors.array().map((err) => ({
                    field: err.path,
                    message: err.msg,
                })),
                timestamp: new Date().toISOString(),
            },
        });
    }
    next();
};

/**
 * Validation rules for user registration
 */
export const registerValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('phone')
        .trim()
        .notEmpty()
        .withMessage('Phone number is required')
        .matches(/^[0-9]{10}$/)
        .withMessage('Please provide a valid 10-digit phone number'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('role')
        .optional()
        .isIn(['donor', 'admin'])
        .withMessage('Role must be either donor or admin'),
];

/**
 * Validation rules for user login
 */
export const loginValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Validation rules for creating a donation order
 */
export const createOrderValidation = [
    body('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isNumeric()
        .withMessage('Amount must be a number')
        .custom((value) => value >= 1)
        .withMessage('Amount must be at least 1'),
    body('programId')
        .notEmpty()
        .withMessage('Program ID is required')
        .isMongoId()
        .withMessage('Invalid program ID'),
    body('visibilityChoice')
        .notEmpty()
        .withMessage('Visibility choice is required')
        .isIn(['public', 'anonymous'])
        .withMessage('Visibility choice must be public or anonymous'),
    body('publicName')
        .if(body('visibilityChoice').equals('public'))
        .notEmpty()
        .withMessage('Public name is required when visibility is public')
        .trim()
        .isLength({ max: 100 })
        .withMessage('Public name cannot exceed 100 characters'),
];

/**
 * Validation rules for creating a program
 */
export const createProgramValidation = [
    body('programName')
        .trim()
        .notEmpty()
        .withMessage('Program name is required')
        .isLength({ min: 3, max: 200 })
        .withMessage('Program name must be between 3 and 200 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
    body('startDate')
        .notEmpty()
        .withMessage('Start date is required')
        .isISO8601()
        .withMessage('Invalid start date format'),
    body('endDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid end date format'),
    body('status')
        .optional()
        .isIn(['active', 'completed', 'archived'])
        .withMessage('Status must be active, completed, or archived'),
];

/**
 * Validation rules for updating program funds
 */
export const updateFundsValidation = [
    body('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isNumeric()
        .withMessage('Amount must be a number')
        .custom((value) => value >= 0)
        .withMessage('Amount cannot be negative'),
];

/**
 * Validation rules for uploading a report
 */
export const uploadReportValidation = [
    body('programId')
        .notEmpty()
        .withMessage('Program ID is required')
        .isMongoId()
        .withMessage('Invalid program ID'),
    body('reportFileURL')
        .trim()
        .notEmpty()
        .withMessage('Report file URL is required')
        .isURL()
        .withMessage('Invalid URL format'),
    body('fundsReceived')
        .notEmpty()
        .withMessage('Funds received is required')
        .isNumeric()
        .withMessage('Funds received must be a number')
        .custom((value) => value >= 0)
        .withMessage('Funds received cannot be negative'),
    body('fundsUtilized')
        .notEmpty()
        .withMessage('Funds utilized is required')
        .isNumeric()
        .withMessage('Funds utilized must be a number')
        .custom((value) => value >= 0)
        .withMessage('Funds utilized cannot be negative'),
];

/**
 * Validation rules for MongoDB ObjectId params
 */
export const mongoIdValidation = [
    param('id').isMongoId().withMessage('Invalid ID format'),
];

/**
 * Validation rules for updating user profile
 */
export const updateProfileValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('phone')
        .optional()
        .trim()
        .matches(/^[0-9]{10}$/)
        .withMessage('Please provide a valid 10-digit phone number'),
];

/**
 * Sanitize input to prevent injection attacks
 */
export const sanitizeInput = (req, res, next) => {
    // Remove any potential MongoDB operators from request body
    const sanitize = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;

        Object.keys(obj).forEach((key) => {
            if (key.startsWith('$')) {
                delete obj[key];
            } else if (typeof obj[key] === 'object') {
                sanitize(obj[key]);
            }
        });

        return obj;
    };

    if (req.body) {
        req.body = sanitize(req.body);
    }

    if (req.query) {
        req.query = sanitize(req.query);
    }

    if (req.params) {
        req.params = sanitize(req.params);
    }

    next();
};
