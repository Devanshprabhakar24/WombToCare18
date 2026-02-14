// User routes
import express from 'express';
import {
    getProfile,
    updateProfile,
    getDonorDashboard,
} from '../controllers/userController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { updateProfileValidation, validate } from '../middleware/validation.js';

const router = express.Router();

// Auth required
router.use(authenticateToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, validate, updateProfile);
router.get('/dashboard', authorizeRole(['donor', 'admin']), getDonorDashboard);

export default router;
