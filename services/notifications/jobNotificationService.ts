import { User, Notification } from '@/lib/models';
import { Types } from 'mongoose';

/**
 * Job Notification Service
 * 
 * Handles notifying users when a new job matches their target role.
 */

interface JobNotificationData {
    _id: Types.ObjectId;
    title: string;
    roleId?: Types.ObjectId;
    source: string;
}

/**
 * notifyUsersForJob
 * 
 * Find users whose targetRole matches the job.roleId and create notifications.
 */
export async function notifyUsersForJob(job: JobNotificationData): Promise<void> {
    try {
        // Validation: Only notify for internal jobs with a roleId
        if (job.source !== 'internal' || !job.roleId) {
            return;
        }

        // 1. Find active users whose targetRoleId matches the job's roleId
        // Using projection to only fetch user IDs for performance
        const users = await User.find({
            'profile.targetRoleId': job.roleId,
            isActive: true
        }).select('_id').lean();

        if (!users || users.length === 0) {
            console.log(`[JobNotification] No users found for role matched job: ${job._id}`);
            return;
        }

        console.log(`[JobNotification] Creating notifications for ${users.length} users for job: ${job._id}`);

        // 2. Prepare notifications for bulk insert
        const notifications = users.map(user => ({
            userId: user._id,
            title: "New Role-Matched Job Posted",
            message: `A new ${job.title} opportunity has been posted for your selected role.`,
            actionUrl: `/jobs/${job._id}`,
            type: 'job_match',
            isRead: false,
            metadata: {
                jobId: job._id,
                roleId: job.roleId
            }
        }));

        // 3. Perform bulk insert for better performance
        // We use try/catch inside to ensure job creation is never blocked
        try {
            await Notification.insertMany(notifications, { ordered: false });
        } catch (insertError: any) {
            // If some fail due to unique constraints or other errors, we log but don't crash
            console.error('[JobNotification] Bulk insert partially failed:', insertError.message);
        }

    } catch (error) {
        // Performance Safety: Do not block main thread or throw errors to the caller
        console.error('[JobNotification] Error in notifyUsersForJob:', error);
    }
}
