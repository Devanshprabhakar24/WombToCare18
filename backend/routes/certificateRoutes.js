// Cert routes
import express from 'express';
import { getCertificate, downloadCertificate } from '../controllers/certificateController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/donation/:donationId', authenticateToken, getCertificate);
router.get('/download/:filename', downloadCertificate);

export default router;
