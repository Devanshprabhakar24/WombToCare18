// Auth logic
import AuthService from '../services/AuthService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Register user
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

// Login user
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await AuthService.login({ email, password });

    res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful',
    });
});

// Get user
export const getMe = asyncHandler(async (req, res) => {
    const user = await AuthService.getUserById(req.user.userId);

    res.status(200).json({
        success: true,
        data: user,
    });
});
