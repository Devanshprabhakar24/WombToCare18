// Donation routes
import express from 'express';
import {
    createOrder,
    verifyPayment,
    getDonationHistory,
    getPublicDonations,
} from '../controllers/donationController.js';
import { authenticateToken } from '../middleware/auth.js';
import { createOrderValidation, validate } from '../middleware/validation.js';

const router = express.Router();

// Protected routes
router.post('/create-order', authenticateToken, createOrderValidation, validate, createOrder);
router.post('/verify', authenticateToken, verifyPayment);
router.get('/history', authenticateToken, getDonationHistory);

// Public routes
router.get('/public', getPublicDonations);

export default router;
