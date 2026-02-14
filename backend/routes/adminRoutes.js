// Admin routes
import express from 'express';
import {
    getAdminDashboard,
    getAllDonations,
    getAllDonors,
    getEmailSchedulerStatus,
    triggerEmailScheduler,
    enableEmailScheduler,
    disableEmailScheduler,
    setEmailScheduleConfig,
    getEmailScheduleOptions,
} from '../controllers/adminController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Admin only
router.use(authenticateToken, authorizeRole(['admin']));

router.get('/dashboard', getAdminDashboard);
router.get('/donations', getAllDonations);
router.get('/donors', getAllDonors);

// Scheduler routes
router.get('/scheduler/status', getEmailSchedulerStatus);
router.get('/scheduler/options', getEmailScheduleOptions);
router.post('/scheduler/trigger', triggerEmailScheduler);
router.post('/scheduler/enable', enableEmailScheduler);
router.post('/scheduler/disable', disableEmailScheduler);
router.put('/scheduler/config', setEmailScheduleConfig);

export default router;
