import AuthService from '../services/AuthService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Register new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = asyncHandler(async (req, res) => {
    const { name, email, phone, password, role } = req.body;

    const result = await AuthService.register({
        name,
        email,
        phone,
        password,
        role,
    });

    res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully',
    });
});

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await AuthService.login({ email, password });

    res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful',
    });
});

/**
 * Get current user
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = asyncHandler(async (req, res) => {
    const user = await AuthService.getUserById(req.user.userId);

    res.status(200).json({
        success: true,
        data: user,
    });
});
