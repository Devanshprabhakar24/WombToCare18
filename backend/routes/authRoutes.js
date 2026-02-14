// Auth routes
import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { registerValidation, loginValidation, validate } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);

// Protected routes
router.get('/me', authenticateToken, getMe);

export default router;
