import AuthService from '../services/AuthService.js';
import DonationService from '../services/DonationService.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get user profile
 * @route GET /api/users/profile
 * @access Private
 */
export const getProfile = asyncHandler(async (req, res) => {
    const user = await AuthService.getUserById(req.user.userId);

    res.status(200).json({
        success: true,
        data: user,
    });
});

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user.userId,
        { name, phone },
        { new: true, runValidators: true }
    ).select('-passwordHash');

    res.status(200).json({
        success: true,
        data: user,
        message: 'Profile updated successfully',
    });
});

/**
 * Get donor dashboard data
 * @route GET /api/users/dashboard
 * @access Private/Donor
 */
export const getDonorDashboard = asyncHandler(async (req, res) => {
    const donations = await DonationService.getDonationHistory(req.user.userId);

    const totalContribution = donations.reduce((sum, donation) => sum + donation.amount, 0);

    res.status(200).json({
        success: true,
        data: {
            donations,
            totalContribution,
            donationCount: donations.length,
        },
    });
});
