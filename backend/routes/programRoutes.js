import express from 'express';
import {
    createProgram,
    getAllPrograms,
    getProgramById,
    updateProgram,
    updateFunds,
    archiveProgram,
} from '../controllers/programController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import {
    createProgramValidation,
    updateFundsValidation,
    mongoIdValidation,
    validate,
} from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getAllPrograms);
router.get('/:id', mongoIdValidation, validate, getProgramById);

// Admin only routes
router.post(
    '/',
    authenticateToken,
    authorizeRole(['admin']),
    createProgramValidation,
    validate,
    createProgram
);

router.put(
    '/:id',
    authenticateToken,
    authorizeRole(['admin']),
    mongoIdValidation,
    validate,
    updateProgram
);

router.put(
    '/:id/funds',
    authenticateToken,
    authorizeRole(['admin']),
    mongoIdValidation,
    updateFundsValidation,
    validate,
    updateFunds
);

router.delete(
    '/:id',
    authenticateToken,
    authorizeRole(['admin']),
    mongoIdValidation,
    validate,
    archiveProgram
);

export default router;
