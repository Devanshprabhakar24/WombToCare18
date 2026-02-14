import cron from 'node-cron';
import Donation from './models/Donation.js';
import Program from './models/Program.js';
import User from './models/User.js';
import EmailService from './services/EmailService.js';

// Scheduler state
let schedulerTask = null;
let schedulerEnabled = true;
let lastRunTime = null;
let lastRunStatus = null;
let emailsSentCount = 0;

// Schedule configuration
let scheduleConfig = {
    type: 'weekly', // 'weekly' | 'interval'
    // Weekly config: specific day and time
    dayOfWeek: 0, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    hour: 9,
    // Interval config: run every N days
    intervalDays: 7,
};

// Day name mapping
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Build cron expression from schedule config
 * @returns {string} - Cron expression
 */
function buildCronExpression() {
    if (scheduleConfig.type === 'weekly') {
        // Weekly: specific day and time
        return `0 ${scheduleConfig.hour} * * ${scheduleConfig.dayOfWeek}`;
    } else {
        // Interval: run at specified time every N days
        // Using a workaround since cron doesn't support "every N days" directly
        // Running daily at specified time, and checking interval in the job
        return `0 ${scheduleConfig.hour} * * *`;
    }
}

/**
 * Get human-readable schedule description
 * @returns {string}
 */
function getScheduleDescription() {
    const timeStr = `${scheduleConfig.hour.toString().padStart(2, '0')}:00`;

    if (scheduleConfig.type === 'weekly') {
        return `Every ${dayNames[scheduleConfig.dayOfWeek]} at ${timeStr}`;
    } else {
        return `Every ${scheduleConfig.intervalDays} day(s) at ${timeStr}`;
    }
}

// Track last interval run for interval-based scheduling
let lastIntervalRun = null;

/**
 * Run progress report job - sends structured updates to all donors
 * @returns {Promise<Object>} - Result with stats
 */
async function runProgressReportJob() {
    console.log('📧 Running progress report job...');
    const startTime = new Date();
    let sentCount = 0;
    let failedCount = 0;
    const results = [];

    try {
        // Get all active programs only - closed programs won't trigger reports
        const activePrograms = await Program.find({ status: 'active' }).lean();
        if (activePrograms.length === 0) {
            console.log('No active programs — skipping reports.');
            lastRunTime = startTime;
            lastRunStatus = 'skipped';
            return { success: true, message: 'No active programs', sentCount: 0, failedCount: 0 };
        }

        const activeProgramIds = activePrograms.map(p => p._id);

        // Find all completed donations to active programs
        const donations = await Donation.find({
            transactionStatus: 'completed',
            programId: { $in: activeProgramIds },
        }).lean();

        // Group by userId and calculate donor's total contribution per program
        const donorProgramMap = {};
        for (const d of donations) {
            const uid = d.userId.toString();
            const pid = d.programId.toString();
            if (!donorProgramMap[uid]) donorProgramMap[uid] = {};
            if (!donorProgramMap[uid][pid]) {
                donorProgramMap[uid][pid] = { totalContribution: 0 };
            }
            donorProgramMap[uid][pid].totalContribution += d.amount;
        }

        // Send email to each donor
        for (const [userId, programContributions] of Object.entries(donorProgramMap)) {
            try {
                const user = await User.findById(userId).lean();
                if (!user || !user.email) continue;

                // Get program details for this donor with structured data
                const programIds = Object.keys(programContributions);
                const programs = activePrograms
                    .filter(p => programIds.includes(p._id.toString()))
                    .map(p => {
                        const targetAmount = p.targetAmount || 0;
                        const fundsReceived = p.fundsReceived || 0;
                        const fundsUtilized = p.fundsUtilized || 0;
                        const remaining = Math.max(targetAmount - fundsReceived, 0);
                        const progressPercentage = targetAmount > 0
                            ? Math.min((fundsReceived / targetAmount) * 100, 100)
                            : 0;
                        const utilizationRate = fundsReceived > 0
                            ? (fundsUtilized / fundsReceived) * 100
                            : 0;

                        return {
                            programName: p.programName,
                            description: p.description,
                            targetAmount,
                            fundsReceived,
                            fundsUtilized,
                            remaining,
                            progressPercentage: progressPercentage.toFixed(1),
                            utilizationRate: utilizationRate.toFixed(1),
                            donorContribution: programContributions[p._id.toString()].totalContribution,
                            startDate: p.startDate,
                            endDate: p.endDate,
                            status: p.status,
                        };
                    });

                const emailResult = await EmailService.sendWeeklyProgressReport({
                    recipientEmail: user.email,
                    donorName: user.name,
                    programs,
                });

                if (emailResult.success) {
                    sentCount++;
                    results.push({ email: user.email, status: 'sent' });
                    console.log(`  ✅ Sent structured report to ${user.email}`);
                } else {
                    failedCount++;
                    results.push({ email: user.email, status: 'failed', error: emailResult.error });
                }
            } catch (err) {
                failedCount++;
                results.push({ userId, status: 'failed', error: err.message });
                console.error(`  ❌ Failed for user ${userId}:`, err.message);
            }
        }

        lastRunTime = startTime;
        lastRunStatus = 'completed';
        emailsSentCount += sentCount;

        console.log(`📧 Progress report job completed. Sent: ${sentCount}, Failed: ${failedCount}`);

        return {
            success: true,
            message: 'Progress reports sent',
            sentCount,
            failedCount,
            totalDonors: Object.keys(donorProgramMap).length,
            activePrograms: activePrograms.length,
            results,
        };
    } catch (error) {
        lastRunTime = startTime;
        lastRunStatus = 'error';
        console.error('Progress report job error:', error);
        return { success: false, error: error.message, sentCount, failedCount };
    }
}

/**
 * Weekly progress report scheduler.
 * Runs based on admin-configured schedule and emails each donor
 * with structured updates on the programs they donated to.
 * Reports are only sent for active programs - once a program is
 * closed (completed/archived), donors will no longer receive reports for it.
 */
export function startScheduler() {
    recreateSchedulerTask();
    console.log(`⏰ Progress report scheduler started: ${getScheduleDescription()}`);
}

/**
 * Recreate the scheduler task with current config
 */
function recreateSchedulerTask() {
    // Stop existing task if any
    if (schedulerTask) {
        schedulerTask.stop();
        schedulerTask = null;
    }

    const cronExpression = buildCronExpression();

    schedulerTask = cron.schedule(cronExpression, async () => {
        if (!schedulerEnabled) {
            console.log('📧 Scheduler is disabled - skipping run');
            return;
        }

        // For interval-based scheduling, check if enough days have passed
        if (scheduleConfig.type === 'interval') {
            if (lastIntervalRun) {
                const daysSinceLastRun = (Date.now() - lastIntervalRun.getTime()) / (1000 * 60 * 60 * 24);
                if (daysSinceLastRun < scheduleConfig.intervalDays - 0.5) {
                    // Not enough days have passed, skip
                    return;
                }
            }
            lastIntervalRun = new Date();
        }

        await runProgressReportJob();
    });
}

/**
 * Manually trigger progress report emails (admin only)
 * @returns {Promise<Object>} - Result with stats
 */
export async function triggerProgressReports() {
    console.log('📧 Admin triggered manual progress report...');
    return await runProgressReportJob();
}

/**
 * Enable the scheduler
 */
export function enableScheduler() {
    schedulerEnabled = true;
    console.log('⏰ Scheduler enabled');
    return { enabled: true };
}

/**
 * Disable the scheduler
 */
export function disableScheduler() {
    schedulerEnabled = false;
    console.log('⏰ Scheduler disabled');
    return { enabled: false };
}

/**
 * Get scheduler status
 * @returns {Object} - Scheduler status
 */
export function getSchedulerStatus() {
    return {
        enabled: schedulerEnabled,
        schedule: getScheduleDescription(),
        scheduleConfig: { ...scheduleConfig },
        lastRunTime,
        lastRunStatus,
        totalEmailsSent: emailsSentCount,
        nextRunEstimate: calculateNextRun(),
    };
}

/**
 * Set scheduler configuration
 * @param {Object} config - Schedule configuration
 * @param {string} config.type - 'weekly' or 'interval'
 * @param {number} config.dayOfWeek - Day of week (0-6, 0=Sunday) for weekly type
 * @param {number} config.hour - Hour (0-23)
 * @param {number} config.intervalDays - Days between runs for interval type
 * @returns {Object} - Updated schedule config
 */
export function setSchedule(config) {
    const { type, dayOfWeek, hour, intervalDays } = config;

    // Validate type
    if (type && !['weekly', 'interval'].includes(type)) {
        throw new Error('Invalid schedule type. Must be "weekly" or "interval"');
    }

    // Update config
    if (type) scheduleConfig.type = type;

    if (typeof dayOfWeek === 'number') {
        if (dayOfWeek < 0 || dayOfWeek > 6) {
            throw new Error('dayOfWeek must be 0-6 (0=Sunday)');
        }
        scheduleConfig.dayOfWeek = dayOfWeek;
    }

    if (typeof hour === 'number') {
        if (hour < 0 || hour > 23) {
            throw new Error('hour must be 0-23');
        }
        scheduleConfig.hour = hour;
    }

    if (typeof intervalDays === 'number') {
        if (intervalDays < 1 || intervalDays > 365) {
            throw new Error('intervalDays must be 1-365');
        }
        scheduleConfig.intervalDays = intervalDays;
    }

    // Recreate the scheduler with new config
    recreateSchedulerTask();

    console.log(`⏰ Schedule updated: ${getScheduleDescription()}`);

    return {
        schedule: getScheduleDescription(),
        scheduleConfig: { ...scheduleConfig },
        nextRunEstimate: calculateNextRun(),
    };
}

/**
 * Calculate next scheduled run time
 * @returns {Date}
 */
function calculateNextRun() {
    const now = new Date();

    if (scheduleConfig.type === 'weekly') {
        // Find next occurrence of the specified day
        const targetDay = scheduleConfig.dayOfWeek;
        const currentDay = now.getDay();
        let daysUntilTarget = (targetDay - currentDay + 7) % 7;

        // If today is the target day, check if time has passed
        if (daysUntilTarget === 0) {
            const targetTime = new Date(now);
            targetTime.setHours(scheduleConfig.hour, 0, 0, 0);
            if (now >= targetTime) {
                daysUntilTarget = 7; // Next week
            }
        }

        const nextRun = new Date(now);
        nextRun.setDate(now.getDate() + daysUntilTarget);
        nextRun.setHours(scheduleConfig.hour, 0, 0, 0);
        return nextRun;
    } else {
        // Interval-based
        if (lastIntervalRun) {
            const nextRun = new Date(lastIntervalRun);
            nextRun.setDate(nextRun.getDate() + scheduleConfig.intervalDays);
            nextRun.setHours(scheduleConfig.hour, 0, 0, 0);
            return nextRun;
        } else {
            // First run will be tomorrow at specified time
            const nextRun = new Date(now);
            nextRun.setDate(now.getDate() + 1);
            nextRun.setHours(scheduleConfig.hour, 0, 0, 0);
            return nextRun;
        }
    }
}

/**
 * Get available day options for UI
 * @returns {Array}
 */
export function getScheduleOptions() {
    return {
        types: [
            { value: 'weekly', label: 'Weekly (specific day)' },
            { value: 'interval', label: 'Interval (every N days)' },
        ],
        days: dayNames.map((name, index) => ({ value: index, label: name })),
        hours: Array.from({ length: 24 }, (_, i) => ({ value: i, label: `${i.toString().padStart(2, '0')}:00` })),
    };
}

/**
 * Get next Sunday at 9 AM (deprecated - use calculateNextRun)
 */
function getNextSundayAt9AM() {
    return calculateNextRun();
}
