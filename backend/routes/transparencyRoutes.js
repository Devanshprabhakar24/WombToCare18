// Transparency routes
import express from 'express';
import {
    getTransparencyData,
    getTransparencyReports,
} from '../controllers/transparencyController.js';

const router = express.Router();

// Public routes
router.get('/programs', getTransparencyData);
router.get('/reports', getTransparencyReports);

export default router;
