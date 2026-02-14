import ReportService from '../services/ReportService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Upload impact report
 * @route POST /api/reports
 * @access Private/Admin
 */
export const uploadReport = asyncHandler(async (req, res) => {
    const report = await ReportService.uploadReport(req.body);

    res.status(201).json({
        success: true,
        data: report,
        message: 'Report uploaded successfully',
    });
});

/**
 * Get all reports
 * @route GET /api/reports
 * @access Public
 */
export const getAllReports = asyncHandler(async (req, res) => {
    const reports = await ReportService.getAllReports();

    res.status(200).json({
        success: true,
        data: reports,
        count: reports.length,
    });
});

/**
 * Get report by program
 * @route GET /api/reports/program/:programId
 * @access Public
 */
export const getReportByProgram = asyncHandler(async (req, res) => {
    const report = await ReportService.getReportByProgram(req.params.programId);

    res.status(200).json({
        success: true,
        data: report,
    });
});
