/**
 * Email Event Service
 * 
 * Central service for triggering lifecycle email events
 * Handles deduplication, template generation, and sending
 */

import connectDB from '@/lib/db/mongoose';
import { UserEmailEvent } from '@/lib/models/UserEmailEvent';
import { User } from '@/lib/models';
import { sendEmail } from '@/lib/email/emailSender';
import { getTemplate } from '@/lib/email/templates';
import type {
    TriggerEmailEventParams,
    TriggerEmailEventResult,
    EmailEventType,
} from '@/types/email-events';

/**
 * Trigger an email event for a user
 * 
 * This is the main entry point for all lifecycle emails.
 * It handles:
 * - Deduplication (checking if event already sent)
 * - User lookup
 * - Template generation
 * - Email sending
 * - Event tracking
 * 
 * @param params - Event parameters
 * @returns Result indicating success or failure
 */
export async function triggerEmailEvent(
    params: TriggerEmailEventParams
): Promise<TriggerEmailEventResult> {
    const { userId, event, metadata = {} } = params;

    try {
        await connectDB();

        // 1. Check if event already sent (for single-fire events)
        const existingEvent = await UserEmailEvent.findOne({
            userId,
            event,
        });

        if (existingEvent) {
            console.log(`[EmailEvent] Event ${event} already sent to user ${userId}, skipping`);
            return {
                success: true,
                alreadySent: true,
            };
        }

        // 2. Load user data
        const user = await User.findById(userId).select('email name emailPreferences');

        if (!user) {
            console.error(`[EmailEvent] User ${userId} not found`);
            return {
                success: false,
                error: 'User not found',
            };
        }

        if (!user.email) {
            console.error(`[EmailEvent] User ${userId} has no email address`);
            return {
                success: false,
                error: 'User has no email address',
            };
        }

        // 3. Check user email preferences (if applicable)
        if (!shouldSendEmail(event, user.emailPreferences)) {
            console.log(`[EmailEvent] User ${userId} has disabled emails for event ${event}`);
            return {
                success: true,
                alreadySent: false,
            };
        }

        // 4. Generate email template
        const template = getTemplate(event, metadata, user.name);

        // 5. Send email
        const emailSent = await sendEmail({
            to: user.email,
            subject: template.subject,
            html: template.html,
        });

        if (!emailSent) {
            console.error(`[EmailEvent] Failed to send email for event ${event} to user ${userId}`);
            return {
                success: false,
                error: 'Failed to send email',
            };
        }

        // 6. Store event record to prevent duplicates
        await UserEmailEvent.create({
            userId,
            event,
            metadata,
            sentAt: new Date(),
        });

        console.log(`[EmailEvent] Successfully sent ${event} email to ${user.email}`);

        return {
            success: true,
            alreadySent: false,
        };
    } catch (error) {
        console.error(`[EmailEvent] Error triggering event ${event} for user ${userId}:`, error);

        // Check if it's a duplicate key error (race condition)
        if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
            console.log(`[EmailEvent] Duplicate event detected (race condition), treating as already sent`);
            return {
                success: true,
                alreadySent: true,
            };
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Trigger multiple email events in parallel
 * Useful for batch operations
 */
export async function triggerEmailEvents(
    events: TriggerEmailEventParams[]
): Promise<TriggerEmailEventResult[]> {
    return Promise.all(events.map(event => triggerEmailEvent(event)));
}

/**
 * Check if email should be sent based on user preferences
 */
function shouldSendEmail(
    event: EmailEventType,
    preferences?: {
        skillReminders?: boolean;
        roadmapUpdates?: boolean;
        weeklyReports?: boolean;
        mentorMessages?: boolean;
        systemAnnouncements?: boolean;
        marketingEmails?: boolean;
    }
): boolean {
    // If no preferences, send all emails
    if (!preferences) {
        return true;
    }

    // Map events to preference settings
    switch (event) {
        case 'WELCOME_USER':
            // Always send welcome emails
            return true;

        case 'ROLE_SELECTED':
        case 'READINESS_FIRST':
        case 'READINESS_MAJOR_IMPROVEMENT':
        case 'ROADMAP_CREATED':
            // Controlled by roadmapUpdates preference
            return preferences.roadmapUpdates !== false;

        case 'MENTOR_SKILL_VALIDATED':
        case 'MENTOR_SKILL_REJECTED':
            // Controlled by mentorMessages preference
            return preferences.mentorMessages !== false;

        case 'USER_INACTIVE_7':
        case 'USER_INACTIVE_14':
        case 'USER_INACTIVE_30':
        case 'PLACEMENT_SEASON_ALERT':
            // Controlled by systemAnnouncements preference
            return preferences.systemAnnouncements !== false;

        case 'WEEKLY_PROGRESS_DIGEST':
            // Controlled by weeklyReports preference
            return preferences.weeklyReports !== false;

        default:
            // Default to sending
            return true;
    }
}

/**
 * Get email event history for a user
 * Useful for debugging and admin panels
 */
export async function getUserEmailHistory(userId: string) {
    try {
        await connectDB();

        const events = await UserEmailEvent.find({ userId })
            .sort({ sentAt: -1 })
            .limit(100)
            .lean();

        return events;
    } catch (error) {
        console.error(`[EmailEvent] Error fetching email history for user ${userId}:`, error);
        return [];
    }
}

/**
 * Check if a specific event was sent to a user
 */
export async function wasEventSent(userId: string, event: EmailEventType): Promise<boolean> {
    try {
        await connectDB();

        const existingEvent = await UserEmailEvent.findOne({
            userId,
            event,
        });

        return !!existingEvent;
    } catch (error) {
        console.error(`[EmailEvent] Error checking if event ${event} was sent to user ${userId}:`, error);
        return false;
    }
}
