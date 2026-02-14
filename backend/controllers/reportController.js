// Report logic
import ReportService from '../services/ReportService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Upload report
export const uploadReport = asyncHandler(async (req, res) => {
    const report = await ReportService.uploadReport(req.body);

    res.status(201).json({
        success: true,
        data: report,
        message: 'Report uploaded successfully',
    });
});

// All reports
export const getAllReports = asyncHandler(async (req, res) => {
    const reports = await ReportService.getAllReports();

    res.status(200).json({
        success: true,
        data: reports,
        count: reports.length,
    });
});

// Report by program
export const getReportByProgram = asyncHandler(async (req, res) => {
    const report = await ReportService.getReportByProgram(req.params.programId);

    res.status(200).json({
        success: true,
        data: report,
    });
});
