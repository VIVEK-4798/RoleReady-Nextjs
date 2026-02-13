/**
 * Email Scheduler - Scheduled Jobs for Lifecycle Emails
 * 
 * Handles:
 * - Inactivity detection (7, 14, 30 days)
 * - Weekly progress digests
 * - Placement season alerts
 */

import connectDB from '@/lib/db/mongoose';
import { User, ReadinessSnapshot, UserEmailEvent, ActivityLog } from '@/lib/models';
import { triggerEmailEvent } from '@/lib/email/emailEventService';
import type { EmailEventType } from '@/types/email-events';

/**
 * Check for inactive users and send reminder emails
 * 
 * Runs daily to check for users who haven't logged in for 7, 14, or 30 days
 */
export async function checkInactiveUsers(): Promise<{
    success: boolean;
    sent: number;
    errors: number;
}> {
    try {
        await connectDB();

        const now = new Date();
        const results = { sent: 0, errors: 0 };

        // Define inactivity thresholds
        const thresholds = [
            { days: 7, event: 'USER_INACTIVE_7' as EmailEventType },
            { days: 14, event: 'USER_INACTIVE_14' as EmailEventType },
            { days: 30, event: 'USER_INACTIVE_30' as EmailEventType },
        ];

        for (const threshold of thresholds) {
            const cutoffDate = new Date(now);
            cutoffDate.setDate(cutoffDate.getDate() - threshold.days);

            // Find users who:
            // 1. Last logged in exactly around this threshold (within 1 day window)
            // 2. Haven't received this specific inactivity email yet
            const startWindow = new Date(cutoffDate);
            startWindow.setDate(startWindow.getDate() - 1);
            const endWindow = new Date(cutoffDate);
            endWindow.setDate(endWindow.getDate() + 1);

            const inactiveUsers = await User.find({
                lastLoginAt: {
                    $gte: startWindow,
                    $lte: endWindow,
                },
                'emailPreferences.systemAnnouncements': { $ne: false }, // Respect preferences
            }).select('_id name email lastLoginAt').lean();

            console.log(`[EmailScheduler] Found ${inactiveUsers.length} users inactive for ~${threshold.days} days`);

            for (const user of inactiveUsers) {
                try {
                    // Check if we already sent this specific inactivity email
                    const alreadySent = await UserEmailEvent.findOne({
                        userId: user._id,
                        event: threshold.event,
                    });

                    if (alreadySent) {
                        console.log(`[EmailScheduler] Already sent ${threshold.event} to user ${user._id}, skipping`);
                        continue;
                    }

                    // Calculate exact days since last login
                    const daysSinceLogin = Math.floor(
                        (now.getTime() - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24)
                    );

                    // Send inactivity email
                    const result = await triggerEmailEvent({
                        userId: user._id.toString(),
                        event: threshold.event,
                        metadata: {
                            daysSinceLastLogin: daysSinceLogin,
                            lastLoginDate: user.lastLoginAt.toISOString(),
                        },
                    });

                    if (result.success) {
                        results.sent++;
                        console.log(`[EmailScheduler] Sent ${threshold.event} to ${user.email}`);
                    } else {
                        results.errors++;
                        console.error(`[EmailScheduler] Failed to send ${threshold.event} to ${user.email}:`, result.error);
                    }
                } catch (error) {
                    results.errors++;
                    console.error(`[EmailScheduler] Error processing user ${user._id}:`, error);
                }
            }
        }

        return {
            success: true,
            sent: results.sent,
            errors: results.errors,
        };
    } catch (error) {
        console.error('[EmailScheduler] checkInactiveUsers error:', error);
        return {
            success: false,
            sent: 0,
            errors: 1,
        };
    }
}

/**
 * Send weekly progress digest to active users
 * 
 * Runs weekly (e.g., every Monday) to send progress summaries
 */
export async function sendWeeklyDigest(): Promise<{
    success: boolean;
    sent: number;
    skipped: number;
    errors: number;
}> {
    try {
        await connectDB();

        const results = { sent: 0, skipped: 0, errors: 0 };
        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Find users who have been active in the last week
        const activeUsers = await User.find({
            lastLoginAt: { $gte: oneWeekAgo },
            'emailPreferences.weeklyReports': { $ne: false }, // Respect preferences
        }).select('_id name email').lean();

        console.log(`[EmailScheduler] Found ${activeUsers.length} active users for weekly digest`);

        for (const user of activeUsers) {
            try {
                // Get user's target role
                const { TargetRole } = await import('@/lib/models');
                const targetRole = await TargetRole.getActiveForUser(user._id.toString());

                if (!targetRole) {
                    results.skipped++;
                    console.log(`[EmailScheduler] User ${user._id} has no target role, skipping digest`);
                    continue;
                }

                const roleId = typeof targetRole.roleId === 'object' && '_id' in targetRole.roleId
                    ? targetRole.roleId._id.toString()
                    : targetRole.roleId.toString();

                const roleName = targetRole.roleId && typeof targetRole.roleId === 'object' && 'name' in targetRole.roleId
                    ? (targetRole.roleId as { name: string }).name
                    : 'Unknown Role';

                // Get latest readiness snapshot
                const latestSnapshot = await ReadinessSnapshot.findOne({
                    userId: user._id,
                    roleId,
                    isActive: true,
                }).sort({ createdAt: -1 }).lean();

                // Get previous snapshot for comparison
                const previousSnapshot = await ReadinessSnapshot.findOne({
                    userId: user._id,
                    roleId,
                    isActive: true,
                }).sort({ createdAt: -1 }).skip(1).lean();

                // Calculate score change
                const currentScore = latestSnapshot?.percentage || 0;
                const previousScore = previousSnapshot?.percentage || 0;
                const scoreChange = currentScore - previousScore;

                // Count skills validated this week
                const skillsValidatedThisWeek = await UserEmailEvent.countDocuments({
                    userId: user._id,
                    event: 'MENTOR_SKILL_VALIDATED',
                    sentAt: { $gte: oneWeekAgo },
                });

                // Count activities this week
                const activitiesThisWeek = await ActivityLog.countDocuments({
                    userId: user._id,
                    createdAt: { $gte: oneWeekAgo },
                });

                // Only send if there's meaningful activity
                const hasActivity = scoreChange > 0 || skillsValidatedThisWeek > 0 || activitiesThisWeek > 0;

                if (!hasActivity) {
                    results.skipped++;
                    console.log(`[EmailScheduler] User ${user._id} has no activity this week, skipping digest`);
                    continue;
                }

                // Send weekly digest
                const result = await triggerEmailEvent({
                    userId: user._id.toString(),
                    event: 'WEEKLY_PROGRESS_DIGEST',
                    metadata: {
                        currentScore,
                        scoreChange: scoreChange > 0 ? scoreChange : undefined,
                        skillsValidated: skillsValidatedThisWeek,
                        activitiesCompleted: activitiesThisWeek,
                        roleName,
                    },
                });

                if (result.success && !result.alreadySent) {
                    results.sent++;
                    console.log(`[EmailScheduler] Sent weekly digest to ${user.email}`);
                } else if (result.alreadySent) {
                    results.skipped++;
                    console.log(`[EmailScheduler] Weekly digest already sent to ${user.email} this week`);
                } else {
                    results.errors++;
                    console.error(`[EmailScheduler] Failed to send weekly digest to ${user.email}:`, result.error);
                }
            } catch (error) {
                results.errors++;
                console.error(`[EmailScheduler] Error processing user ${user._id}:`, error);
            }
        }

        return {
            success: true,
            sent: results.sent,
            skipped: results.skipped,
            errors: results.errors,
        };
    } catch (error) {
        console.error('[EmailScheduler] sendWeeklyDigest error:', error);
        return {
            success: false,
            sent: 0,
            skipped: 0,
            errors: 1,
        };
    }
}

/**
 * Send placement season alert to all eligible users
 * 
 * Manually triggered by admin or scheduled for specific dates
 */
export async function sendPlacementAlert(params?: {
    season?: string;
    year?: number;
    targetUserIds?: string[];
}): Promise<{
    success: boolean;
    sent: number;
    errors: number;
}> {
    try {
        await connectDB();

        const results = { sent: 0, errors: 0 };
        const { season, year, targetUserIds } = params || {};

        // Build query
        const query: any = {
            'emailPreferences.systemAnnouncements': { $ne: false },
        };

        // If specific users targeted
        if (targetUserIds && targetUserIds.length > 0) {
            query._id = { $in: targetUserIds };
        }

        const users = await User.find(query).select('_id name email').lean();

        console.log(`[EmailScheduler] Sending placement alert to ${users.length} users`);

        for (const user of users) {
            try {
                const result = await triggerEmailEvent({
                    userId: user._id.toString(),
                    event: 'PLACEMENT_SEASON_ALERT',
                    metadata: {
                        season,
                        year,
                    },
                });

                if (result.success && !result.alreadySent) {
                    results.sent++;
                    console.log(`[EmailScheduler] Sent placement alert to ${user.email}`);
                } else if (result.alreadySent) {
                    console.log(`[EmailScheduler] Placement alert already sent to ${user.email}`);
                } else {
                    results.errors++;
                    console.error(`[EmailScheduler] Failed to send placement alert to ${user.email}:`, result.error);
                }
            } catch (error) {
                results.errors++;
                console.error(`[EmailScheduler] Error processing user ${user._id}:`, error);
            }
        }

        return {
            success: true,
            sent: results.sent,
            errors: results.errors,
        };
    } catch (error) {
        console.error('[EmailScheduler] sendPlacementAlert error:', error);
        return {
            success: false,
            sent: 0,
            errors: 1,
        };
    }
}

/**
 * Run all scheduled jobs
 * 
 * This is the main entry point for the cron job
 */
export async function runScheduledJobs(): Promise<{
    success: boolean;
    results: {
        inactivity: Awaited<ReturnType<typeof checkInactiveUsers>>;
        weeklyDigest?: Awaited<ReturnType<typeof sendWeeklyDigest>>;
    };
}> {
    console.log('[EmailScheduler] Running scheduled jobs...');

    const results: any = {};

    // Always check for inactive users (runs daily)
    results.inactivity = await checkInactiveUsers();

    // Send weekly digest only on Mondays (or configured day)
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    if (today === 1) { // Monday
        results.weeklyDigest = await sendWeeklyDigest();
    }

    console.log('[EmailScheduler] Scheduled jobs complete:', results);

    return {
        success: true,
        results,
    };
}
