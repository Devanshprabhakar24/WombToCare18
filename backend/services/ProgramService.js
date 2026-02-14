import Program from '../models/Program.js';

class ProgramService {
    /**
     * Create new program
     * @param {Object} programData - Program details
     * @returns {Promise<Object>} - Created program
     */
    async createProgram(programData) {
        const { programName, description, targetAmount, startDate, endDate, status = 'active' } = programData;

        // Check if program with same name exists
        const existingProgram = await Program.findOne({ programName });
        if (existingProgram) {
            throw new Error('Program with this name already exists');
        }

        const program = await Program.create({
            programName,
            description,
            targetAmount: targetAmount || 0,
            startDate,
            endDate,
            status,
            fundsReceived: 0,
            fundsUtilized: 0,
        });

        return {
            programId: program._id.toString(),
            programName: program.programName,
        };
    }

    /**
     * Update funds received for a program
     * @param {string} programId - Program ID
     * @param {number} amount - Amount to add
     * @returns {Promise<Object>} - Updated funds received
     */
    async updateFundsReceived(programId, amount) {
        const program = await Program.findByIdAndUpdate(
            programId,
            { $inc: { fundsReceived: amount } },
            { new: true }
        );

        if (!program) {
            throw new Error('Program not found');
        }

        return {
            fundsReceived: program.fundsReceived,
        };
    }

    /**
     * Update funds utilized for a program
     * @param {string} programId - Program ID
     * @param {number} amount - New funds utilized amount
     * @returns {Promise<Object>} - Updated funds utilized
     */
    async updateFundsUtilized(programId, amount) {
        const program = await Program.findById(programId);

        if (!program) {
            throw new Error('Program not found');
        }

        if (amount > program.fundsReceived) {
            throw new Error('Funds utilized cannot exceed funds received');
        }

        program.fundsUtilized = amount;
        await program.save();

        return {
            fundsUtilized: program.fundsUtilized,
            fundsReceived: program.fundsReceived,
        };
    }

    /**
     * Get transparency data for a program
     * @param {string} programId - Program ID
     * @returns {Promise<Object>} - Transparency data
     */
    async getTransparencyData(programId) {
        const program = await Program.findById(programId);

        if (!program) {
            throw new Error('Program not found');
        }

        const utilizationRate =
            program.fundsReceived > 0
                ? (program.fundsUtilized / program.fundsReceived) * 100
                : 0;

        return {
            programName: program.programName,
            fundsReceived: program.fundsReceived,
            fundsUtilized: program.fundsUtilized,
            utilizationRate: utilizationRate.toFixed(2),
        };
    }

    /**
     * Get all programs with fund data
     * @param {Object} filters - Filter options
     * @returns {Promise<Array>} - Array of programs
     */
    async getAllProgramsWithFunds(filters = {}) {
        const query = {};

        if (filters.status) {
            query.status = filters.status;
        }

        const programs = await Program.find(query).sort({ createdAt: -1 }).lean();

        return programs.map((program) => ({
            programId: program._id.toString(),
            programName: program.programName,
            description: program.description,
            targetAmount: program.targetAmount || 0,
            fundsReceived: program.fundsReceived,
            fundsUtilized: program.fundsUtilized,
            utilizationRate:
                program.fundsReceived > 0
                    ? ((program.fundsUtilized / program.fundsReceived) * 100).toFixed(2)
                    : 0,
            status: program.status,
            startDate: program.startDate,
            endDate: program.endDate,
            createdAt: program.createdAt,
        }));
    }

    /**
     * Get program by ID
     * @param {string} programId - Program ID
     * @returns {Promise<Object>} - Program details
     */
    async getProgramById(programId) {
        const program = await Program.findById(programId).lean();

        if (!program) {
            throw new Error('Program not found');
        }

        return {
            ...program,
            programId: program._id.toString(),
            utilizationRate:
                program.fundsReceived > 0
                    ? ((program.fundsUtilized / program.fundsReceived) * 100).toFixed(2)
                    : 0,
        };
    }

    /**
     * Update program details
     * @param {string} programId - Program ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} - Updated program
     */
    async updateProgram(programId, updateData) {
        const program = await Program.findByIdAndUpdate(
            programId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!program) {
            throw new Error('Program not found');
        }

        return program;
    }

    /**
     * Archive program
     * @param {string} programId - Program ID
     * @returns {Promise<Object>} - Archived program
     */
    async archiveProgram(programId) {
        const program = await Program.findByIdAndUpdate(
            programId,
            { status: 'archived' },
            { new: true }
        );

        if (!program) {
            throw new Error('Program not found');
        }

        return program;
    }

    /**
     * Get program statistics
     * @returns {Promise<Object>} - Program statistics
     */
    async getProgramStats() {
        const totalPrograms = await Program.countDocuments();
        const activePrograms = await Program.countDocuments({ status: 'active' });

        const fundStats = await Program.aggregate([
            {
                $group: {
                    _id: null,
                    totalFundsReceived: { $sum: '$fundsReceived' },
                    totalFundsUtilized: { $sum: '$fundsUtilized' },
                },
            },
        ]);

        return {
            totalPrograms,
            activePrograms,
            totalFundsReceived: fundStats[0]?.totalFundsReceived || 0,
            totalFundsUtilized: fundStats[0]?.totalFundsUtilized || 0,
        };
    }
}

export default new ProgramService();
