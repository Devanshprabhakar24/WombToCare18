import CertificateService from '../services/CertificateService.js';
import DonationService from '../services/DonationService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import path from 'path';

/**
 * Get certificate by donation ID
 * @route GET /api/certificates/donation/:donationId
 * @access Private
 */
export const getCertificate = asyncHandler(async (req, res) => {
    const { donationId } = req.params;

    // Verify user owns the donation or is admin
    const donation = await DonationService.getDonationById(donationId);

    if (donation.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({
            error: {
                message: 'You do not have permission to access this certificate',
                code: 'AUTHORIZATION_ERROR',
            },
        });
    }

    const certificate = await CertificateService.getCertificateByDonation(donationId);

    res.status(200).json({
        success: true,
        data: certificate,
    });
});

/**
 * Download certificate file
 * @route GET /api/certificates/download/:filename
 * @access Public (with valid filename)
 */
export const downloadCertificate = asyncHandler(async (req, res) => {
    const { filename } = req.params;

    const filepath = CertificateService.getCertificateFilePath(filename);

    res.download(filepath, filename, (err) => {
        if (err) {
            res.status(404).json({
                error: {
                    message: 'Certificate not found',
                    code: 'NOT_FOUND',
                },
            });
        }
    });
});
