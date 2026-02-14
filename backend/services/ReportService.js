// Report service
import Report from '../models/Report.js';
import Program from '../models/Program.js';

class ReportService {
    // Upload report
    async uploadReport(reportData) {
        const { programId, reportFileURL, fundsReceived, fundsUtilized } = reportData;

        // Check program
        const program = await Program.findById(programId);
        if (!program) {
            throw new Error('Program not found');
        }

        // Create report
        const report = await Report.create({
            programId,
            fundsReceived,
            fundsUtilized,
            reportFileURL,
        });

        return {
            reportId: report._id.toString(),
            message: 'Report uploaded successfully',
        };
    }

    // All reports
    async getAllReports() {
        const reports = await Report.find()
            .populate('programId', 'programName description status')
            .sort({ lastUpdated: -1 })
            .lean();

        return reports.map((report) => ({
            reportId: report._id.toString(),
            programName: report.programId?.programName || 'Unknown Program',
            programDescription: report.programId?.description || '',
            fundsReceived: report.fundsReceived,
            fundsUtilized: report.fundsUtilized,
            utilizationRate:
                report.fundsReceived > 0
                    ? ((report.fundsUtilized / report.fundsReceived) * 100).toFixed(2)
                    : 0,
            reportFileURL: report.reportFileURL,
            lastUpdated: report.lastUpdated,
        }));
    }

    // By program
    async getReportByProgram(programId) {
        const report = await Report.findOne({ programId })
            .sort({ lastUpdated: -1 })
            .lean();

        if (!report) {
            throw new Error('Report not found for this program');
        }

        return {
            reportFileURL: report.reportFileURL,
            fundsReceived: report.fundsReceived,
            fundsUtilized: report.fundsUtilized,
            lastUpdated: report.lastUpdated,
        };
    }

    // Update report
    async updateReport(reportId, updateData) {
        const report = await Report.findByIdAndUpdate(
            reportId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!report) {
            throw new Error('Report not found');
        }

        return report;
    }

    // Delete report
    async deleteReport(reportId) {
        const report = await Report.findByIdAndDelete(reportId);

        if (!report) {
            throw new Error('Report not found');
        }

        return { message: 'Report deleted successfully' };
    }

    // Reports by date
    async getReportsByDateRange(startDate, endDate) {
        const reports = await Report.find({
            lastUpdated: {
                $gte: startDate,
                $lte: endDate,
            },
        })
            .populate('programId', 'programName')
            .sort({ lastUpdated: -1 })
            .lean();

        return reports;
    }
}

export default new ReportService();
