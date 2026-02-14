/**
 * Validation Routing Service
 * 
 * SINGLE SOURCE OF TRUTH for validation request routing.
 * 
 * CORE RULE:
 * - If user has mentorId → route to that mentor ONLY
 * - If user has no mentorId → route to admin queue
 * 
 * This service MUST be used everywhere validation recipients are determined:
 * - Notifications
 * - Dashboard queries
 * - Email triggers
 * - Queue displays
 * 
 * DO NOT re-implement this logic elsewhere.
 */

import { Types } from 'mongoose';
import dbConnect from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import type { ValidationRecipient } from '@/types/mentor';

// ============================================================================
// Core Routing Logic
// ============================================================================

/**
 * Get validation recipients for a user's validation request
 * 
 * This is the ONLY function that should determine where validation requests go.
 * 
 * @param userId - User requesting validation
 * @returns Recipient information (mentor or admins)
 */
export async function getValidationRecipients(
    userId: string | Types.ObjectId
): Promise<ValidationRecipient> {
    try {
        await dbConnect();

        const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

        // Fetch user with mentor information
        const user = await User.findById(userObjectId)
            .select('mentorId role')
            .populate('mentorId', 'isActive')
            .lean();

        if (!user) {
            // User not found - default to admin queue
            return {
                recipientType: 'admin',
                recipientIds: await getAdminIds(),
                reason: 'User not found',
            };
        }

        // Check if user has an assigned mentor
        if (user.mentorId) {
            const mentor = user.mentorId as any;

            // Verify mentor is still active
            if (mentor.isActive === false) {
                // Mentor is inactive - route to admins
                return {
                    recipientType: 'admin',
                    recipientIds: await getAdminIds(),
                    reason: 'Assigned mentor is inactive',
                };
            }

            // Route to assigned mentor
            return {
                recipientType: 'mentor',
                recipientIds: [mentor._id.toString()],
                reason: 'User has assigned mentor',
            };
        }

        // No mentor assigned - route to admin queue
        return {
            recipientType: 'admin',
            recipientIds: await getAdminIds(),
            reason: 'No mentor assigned',
        };

    } catch (error) {
        console.error('Error in getValidationRecipients:', error);

        // On error, default to admin queue for safety
        return {
            recipientType: 'admin',
            recipientIds: await getAdminIds(),
            reason: 'Error determining recipients',
        };
    }
}

/**
 * Check if a specific mentor should see a user's validation requests
 * 
 * @param userId - User who owns the validation request
 * @param mentorId - Mentor checking access
 * @returns True if mentor should see this user's validations
 */
export async function canMentorSeeUserValidations(
    userId: string | Types.ObjectId,
    mentorId: string | Types.ObjectId
): Promise<boolean> {
    try {
        await dbConnect();

        const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
        const mentorObjectId = typeof mentorId === 'string' ? new Types.ObjectId(mentorId) : mentorId;

        const user = await User.findById(userObjectId).select('mentorId').lean();

        if (!user || !user.mentorId) {
            return false; // No mentor assigned, so no mentor can see
        }

        return user.mentorId.toString() === mentorObjectId.toString();

    } catch (error) {
        console.error('Error in canMentorSeeUserValidations:', error);
        return false;
    }
}

/**
 * Get all admin user IDs
 * 
 * @returns Array of admin user IDs
 */
async function getAdminIds(): Promise<string[]> {
    try {
        const admins = await User.find({
            role: 'admin',
            isActive: true,
        })
            .select('_id')
            .lean();

        return admins.map(admin => admin._id.toString());

    } catch (error) {
        console.error('Error fetching admin IDs:', error);
        return [];
    }
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Get validation recipients for multiple users at once
 * Useful for bulk notification scenarios
 * 
 * @param userIds - Array of user IDs
 * @returns Map of userId to recipients
 */
export async function getValidationRecipientsForUsers(
    userIds: (string | Types.ObjectId)[]
): Promise<Map<string, ValidationRecipient>> {
    try {
        await dbConnect();

        const results = new Map<string, ValidationRecipient>();

        // Fetch all users in one query
        const users = await User.find({
            _id: { $in: userIds },
        })
            .select('mentorId')
            .populate('mentorId', 'isActive')
            .lean();

        const adminIds = await getAdminIds();

        for (const user of users) {
            const userId = user._id.toString();

            if (user.mentorId) {
                const mentor = user.mentorId as any;

                if (mentor.isActive === false) {
                    results.set(userId, {
                        recipientType: 'admin',
                        recipientIds: adminIds,
                        reason: 'Assigned mentor is inactive',
                    });
                } else {
                    results.set(userId, {
                        recipientType: 'mentor',
                        recipientIds: [mentor._id.toString()],
                        reason: 'User has assigned mentor',
                    });
                }
            } else {
                results.set(userId, {
                    recipientType: 'admin',
                    recipientIds: adminIds,
                    reason: 'No mentor assigned',
                });
            }
        }

        return results;

    } catch (error) {
        console.error('Error in getValidationRecipientsForUsers:', error);
        return new Map();
    }
}
