// Transparency logic
import ProgramService from '../services/ProgramService.js';
import ReportService from '../services/ReportService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// All programs
export const getTransparencyData = asyncHandler(async (req, res) => {
    const programs = await ProgramService.getAllProgramsWithFunds({ status: 'active' });

    res.status(200).json({
        success: true,
        data: programs,
        count: programs.length,
    });
});

// All reports
export const getTransparencyReports = asyncHandler(async (req, res) => {
    const reports = await ReportService.getAllReports();

    res.status(200).json({
        success: true,
        data: reports,
        count: reports.length,
    });
});
