// Admin logic
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

// Dashboard stats
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

// All donations
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

// All donors
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

// Scheduler status
export const getEmailSchedulerStatus = asyncHandler(async (req, res) => {
    const status = getSchedulerStatus();

    res.status(200).json({
        success: true,
        data: status,
    });
});

// Trigger emails
export const triggerEmailScheduler = asyncHandler(async (req, res) => {
    const result = await triggerProgressReports();

    res.status(200).json({
        success: result.success,
        message: result.message || (result.success ? 'Progress reports triggered' : 'Failed to trigger reports'),
        data: result,
    });
});

// Enable scheduler
export const enableEmailScheduler = asyncHandler(async (req, res) => {
    const result = enableScheduler();

    res.status(200).json({
        success: true,
        message: 'Email scheduler enabled',
        data: result,
    });
});

// Disable scheduler
export const disableEmailScheduler = asyncHandler(async (req, res) => {
    const result = disableScheduler();

    res.status(200).json({
        success: true,
        message: 'Email scheduler disabled',
        data: result,
    });
});

// Set schedule
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

// Schedule options
export const getEmailScheduleOptions = asyncHandler(async (req, res) => {
    const options = getScheduleOptions();

    res.status(200).json({
        success: true,
        data: options,
    });
});
