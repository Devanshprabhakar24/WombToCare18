import DonationService from '../services/DonationService.js';
import ProgramService from '../services/ProgramService.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
    triggerProgressReports,
    enableScheduler,
    disableScheduler,
    getSchedulerStatus,
    setSchedule,
    getScheduleOptions,
} from '../scheduler.js';

/**
 * Get admin dashboard analytics
 * @route GET /api/admin/dashboard
 * @access Private/Admin
 */
export const getAdminDashboard = asyncHandler(async (req, res) => {
    const donationStats = await DonationService.getDonationStats();
    const programStats = await ProgramService.getProgramStats();

    res.status(200).json({
        success: true,
        data: {
            ...donationStats,
            ...programStats,
        },
    });
});

/**
 * Get all donations
 * @route GET /api/admin/donations
 * @access Private/Admin
 */
export const getAllDonations = asyncHandler(async (req, res) => {
    const { programId, status, startDate, endDate } = req.query;

    const donations = await DonationService.getAllDonations({
        programId,
        status,
        startDate,
        endDate,
    });

    res.status(200).json({
        success: true,
        data: donations,
        count: donations.length,
    });
});

/**
 * Get all donors
 * @route GET /api/admin/donors
 * @access Private/Admin
 */
export const getAllDonors = asyncHandler(async (req, res) => {
    const donors = await User.find({ role: 'donor' })
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .lean();

    res.status(200).json({
        success: true,
        data: donors,
        count: donors.length,
    });
});

/**
 * Get email scheduler status
 * @route GET /api/admin/scheduler/status
 * @access Private/Admin
 */
export const getEmailSchedulerStatus = asyncHandler(async (req, res) => {
    const status = getSchedulerStatus();

    res.status(200).json({
        success: true,
        data: status,
    });
});

/**
 * Manually trigger progress report emails
 * @route POST /api/admin/scheduler/trigger
 * @access Private/Admin
 */
export const triggerEmailScheduler = asyncHandler(async (req, res) => {
    const result = await triggerProgressReports();

    res.status(200).json({
        success: result.success,
        message: result.message || (result.success ? 'Progress reports triggered' : 'Failed to trigger reports'),
        data: result,
    });
});

/**
 * Enable email scheduler
 * @route POST /api/admin/scheduler/enable
 * @access Private/Admin
 */
export const enableEmailScheduler = asyncHandler(async (req, res) => {
    const result = enableScheduler();

    res.status(200).json({
        success: true,
        message: 'Email scheduler enabled',
        data: result,
    });
});

/**
 * Disable email scheduler
 * @route POST /api/admin/scheduler/disable
 * @access Private/Admin
 */
export const disableEmailScheduler = asyncHandler(async (req, res) => {
    const result = disableScheduler();

    res.status(200).json({
        success: true,
        message: 'Email scheduler disabled',
        data: result,
    });
});

/**
 * Set email scheduler configuration
 * @route PUT /api/admin/scheduler/config
 * @access Private/Admin
 * @body {
 *   type: 'weekly' | 'interval',
 *   dayOfWeek: 0-6 (0=Sunday),
 *   hour: 0-23,
 *   minute: 0-59,
 *   intervalDays: 1-365
 * }
 */
export const setEmailScheduleConfig = asyncHandler(async (req, res) => {
    const { type, dayOfWeek, hour, minute, intervalDays } = req.body;

    try {
        const result = setSchedule({ type, dayOfWeek, hour, minute, intervalDays });

        res.status(200).json({
            success: true,
            message: `Schedule updated: ${result.schedule}`,
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * Get schedule configuration options (for UI dropdowns)
 * @route GET /api/admin/scheduler/options
 * @access Private/Admin
 */
export const getEmailScheduleOptions = asyncHandler(async (req, res) => {
    const options = getScheduleOptions();

    res.status(200).json({
        success: true,
        data: options,
    });
});
