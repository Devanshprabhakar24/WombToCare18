// Report routes
import express from 'express';
import {
    uploadReport,
    getAllReports,
    getReportByProgram,
} from '../controllers/reportController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { uploadReportValidation, validate } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getAllReports);
router.get('/program/:programId', getReportByProgram);

// Admin routes
router.post(
    '/',
    authenticateToken,
    authorizeRole(['admin']),
    uploadReportValidation,
    validate,
    uploadReport
);

export default router;
