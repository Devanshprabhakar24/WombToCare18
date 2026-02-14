import ProgramService from '../services/ProgramService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Create new program
 * @route POST /api/programs
 * @access Private/Admin
 */
export const createProgram = asyncHandler(async (req, res) => {
    const program = await ProgramService.createProgram(req.body);

    res.status(201).json({
        success: true,
        data: program,
        message: 'Program created successfully',
    });
});

/**
 * Get all programs
 * @route GET /api/programs
 * @access Public
 */
export const getAllPrograms = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const programs = await ProgramService.getAllProgramsWithFunds({ status });

    res.status(200).json({
        success: true,
        data: programs,
        count: programs.length,
    });
});

/**
 * Get program by ID
 * @route GET /api/programs/:id
 * @access Public
 */
export const getProgramById = asyncHandler(async (req, res) => {
    const program = await ProgramService.getProgramById(req.params.id);

    res.status(200).json({
        success: true,
        data: program,
    });
});

/**
 * Update program
 * @route PUT /api/programs/:id
 * @access Private/Admin
 */
export const updateProgram = asyncHandler(async (req, res) => {
    const program = await ProgramService.updateProgram(req.params.id, req.body);

    res.status(200).json({
        success: true,
        data: program,
        message: 'Program updated successfully',
    });
});

/**
 * Update program funds utilized
 * @route PUT /api/programs/:id/funds
 * @access Private/Admin
 */
export const updateFunds = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const result = await ProgramService.updateFundsUtilized(req.params.id, amount);

    res.status(200).json({
        success: true,
        data: result,
        message: 'Funds updated successfully',
    });
});

/**
 * Archive program
 * @route DELETE /api/programs/:id
 * @access Private/Admin
 */
export const archiveProgram = asyncHandler(async (req, res) => {
    const program = await ProgramService.archiveProgram(req.params.id);

    res.status(200).json({
        success: true,
        data: program,
        message: 'Program archived successfully',
    });
});
