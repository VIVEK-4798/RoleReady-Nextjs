/**
 * Mentor Assignment Service
 * 
 * Handles all mentor-to-user assignment operations.
 * This is the single source of truth for mentor ownership.
 * 
 * CORE RULES:
 * - Only admins can assign/change mentors
 * - Assignments are tracked with timestamps and admin attribution
 * - Activity logs are created for audit trail
 * - Notifications are triggered on assignment changes
 */

import { Types } from 'mongoose';
import dbConnect from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import ActivityLog from '@/lib/models/ActivityLog';
import type {
    AssignMentorResult,
    ChangeMentorResult,
    MentorUser
} from '@/types/mentor';

// ============================================================================
// Mentor Assignment
// ============================================================================

/**
 * Assign a mentor to a user
 * 
 * @param userId - User to assign mentor to
 * @param mentorId - Mentor to assign
 * @param adminId - Admin performing the assignment
 * @returns Result with success status and assignment details
 */
export async function assignMentorToUser(
    userId: string | Types.ObjectId,
    mentorId: string | Types.ObjectId,
    adminId: string | Types.ObjectId
): Promise<AssignMentorResult> {
    try {
        await dbConnect();

        const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
        const mentorObjectId = typeof mentorId === 'string' ? new Types.ObjectId(mentorId) : mentorId;
        const adminObjectId = typeof adminId === 'string' ? new Types.ObjectId(adminId) : adminId;

        // Verify user exists and is a 'user' role
        const user = await User.findById(userObjectId);
        if (!user) {
            return { success: false, message: 'User not found', error: 'USER_NOT_FOUND' };
        }

        if (user.role !== 'user') {
            return {
                success: false,
                message: 'Can only assign mentors to users with "user" role',
                error: 'INVALID_USER_ROLE'
            };
        }

        // Check if user already has this mentor assigned
        if (user.mentorId && user.mentorId.toString() === mentorObjectId.toString()) {
            return {
                success: false,
                message: 'This mentor is already assigned to this user',
                error: 'ALREADY_ASSIGNED'
            };
        }

        // Verify mentor exists and has 'mentor' role
        const mentor = await User.findById(mentorObjectId);
        if (!mentor) {
            return { success: false, message: 'Mentor not found', error: 'MENTOR_NOT_FOUND' };
        }

        if (mentor.role !== 'mentor') {
            return {
                success: false,
                message: 'Selected user is not a mentor',
                error: 'INVALID_MENTOR_ROLE'
            };
        }

        if (!mentor.isActive) {
            return {
                success: false,
                message: 'Cannot assign inactive mentor',
                error: 'MENTOR_INACTIVE'
            };
        }

        // Verify admin exists and has 'admin' role
        const admin = await User.findById(adminObjectId);
        if (!admin || admin.role !== 'admin') {
            return {
                success: false,
                message: 'Only admins can assign mentors',
                error: 'UNAUTHORIZED'
            };
        }

        // Perform assignment
        const now = new Date();
        user.mentorId = mentorObjectId;
        user.mentorAssignedAt = now;
        user.mentorAssignedBy = adminObjectId;

        // Also update legacy field for backward compatibility
        user.assignedMentor = mentorObjectId;

        await user.save();

        // Create activity log (fire-and-forget)
        ActivityLog.logActivity(
            userObjectId,
            'user',
            'role_changed', // Using existing action type
            {
                action: 'mentor_assigned',
                mentorId: mentorObjectId.toString(),
                assignedBy: adminObjectId.toString(),
            }
        ).catch(err => console.error('Failed to log mentor assignment:', err));

        // TODO: Trigger notification to mentor
        // notificationService.notifyMentorAssignment(mentorId, userId, adminId);

        return {
            success: true,
            message: `Successfully assigned ${mentor.name} as mentor to ${user.name}`,
            assignment: {
                userId: userObjectId,
                mentorId: mentorObjectId,
                assignedBy: adminObjectId,
                assignedAt: now,
            },
        };

    } catch (error) {
        console.error('Error in assignMentorToUser:', error);
        return {
            success: false,
            message: 'Failed to assign mentor',
            error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
        };
    }
}

// ============================================================================
// Change Mentor
// ============================================================================

/**
 * Change a user's assigned mentor
 * 
 * @param userId - User whose mentor to change
 * @param newMentorId - New mentor to assign (or null to unassign)
 * @param adminId - Admin performing the change
 * @returns Result with success status and change details
 */
export async function changeMentor(
    userId: string | Types.ObjectId,
    newMentorId: string | Types.ObjectId | null,
    adminId: string | Types.ObjectId
): Promise<ChangeMentorResult> {
    try {
        await dbConnect();

        const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
        const adminObjectId = typeof adminId === 'string' ? new Types.ObjectId(adminId) : adminId;
        const newMentorObjectId = newMentorId
            ? (typeof newMentorId === 'string' ? new Types.ObjectId(newMentorId) : newMentorId)
            : null;

        // Verify user exists
        const user = await User.findById(userObjectId);
        if (!user) {
            return {
                success: false,
                message: 'User not found',
                error: 'USER_NOT_FOUND',
                previousMentorId: null,
                newMentorId: null,
            };
        }

        const previousMentorId = user.mentorId ? user.mentorId.toString() : null;

        // If unassigning (newMentorId is null)
        if (!newMentorObjectId) {
            user.mentorId = null;
            user.mentorAssignedAt = null;
            user.mentorAssignedBy = null;
            user.assignedMentor = undefined;

            await user.save();

            // Log activity
            ActivityLog.logActivity(
                userObjectId,
                'user',
                'role_changed',
                {
                    action: 'mentor_unassigned',
                    previousMentorId,
                    unassignedBy: adminObjectId.toString(),
                }
            ).catch(err => console.error('Failed to log mentor unassignment:', err));

            return {
                success: true,
                message: 'Mentor unassigned successfully',
                previousMentorId,
                newMentorId: null,
            };
        }

        // Verify new mentor
        const newMentor = await User.findById(newMentorObjectId);
        if (!newMentor || newMentor.role !== 'mentor') {
            return {
                success: false,
                message: 'Invalid mentor',
                error: 'INVALID_MENTOR',
                previousMentorId,
                newMentorId: null,
            };
        }

        if (!newMentor.isActive) {
            return {
                success: false,
                message: 'Cannot assign inactive mentor',
                error: 'MENTOR_INACTIVE',
                previousMentorId,
                newMentorId: null,
            };
        }

        // Perform change
        const now = new Date();
        user.mentorId = newMentorObjectId;
        user.mentorAssignedAt = now;
        user.mentorAssignedBy = adminObjectId;
        user.assignedMentor = newMentorObjectId;

        await user.save();

        // Log activity
        ActivityLog.logActivity(
            userObjectId,
            'user',
            'role_changed',
            {
                action: 'mentor_changed',
                previousMentorId,
                newMentorId: newMentorObjectId.toString(),
                changedBy: adminObjectId.toString(),
            }
        ).catch(err => console.error('Failed to log mentor change:', err));

        // TODO: Notify both old and new mentors
        // notificationService.notifyMentorChange(previousMentorId, newMentorId, userId, adminId);

        return {
            success: true,
            message: `Mentor changed successfully to ${newMentor.name}`,
            previousMentorId,
            newMentorId: newMentorObjectId.toString(),
        };

    } catch (error) {
        console.error('Error in changeMentor:', error);
        return {
            success: false,
            message: 'Failed to change mentor',
            error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
            previousMentorId: null,
            newMentorId: null,
        };
    }
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get all users assigned to a specific mentor
 * 
 * @param mentorId - Mentor ID
 * @returns Array of users with their pending validation counts
 */
export async function getUsersByMentor(
    mentorId: string | Types.ObjectId
): Promise<MentorUser[]> {
    try {
        await dbConnect();

        const mentorObjectId = typeof mentorId === 'string' ? new Types.ObjectId(mentorId) : mentorId;

        const users = await User.find({
            mentorId: mentorObjectId,
            role: 'user',
            isActive: true,
        })
            .select('name email role mentorAssignedAt')
            .sort({ mentorAssignedAt: -1 })
            .lean();

        // TODO: Get pending validation counts from UserSkill model
        // For now, return 0 for each user
        return users.map(user => ({
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            assignedAt: user.mentorAssignedAt || new Date(),
            pendingValidations: 0, // Will be populated from UserSkill queries
        }));

    } catch (error) {
        console.error('Error in getUsersByMentor:', error);
        return [];
    }
}

/**
 * Get mentor workload statistics
 * 
 * @param mentorId - Mentor ID
 * @returns Workload stats including assigned users and pending validations
 */
export async function getMentorWorkload(
    mentorId: string | Types.ObjectId
): Promise<{ assignedUsersCount: number; pendingValidationsCount: number }> {
    try {
        await dbConnect();

        const mentorObjectId = typeof mentorId === 'string' ? new Types.ObjectId(mentorId) : mentorId;

        // Count assigned users
        const assignedUsersCount = await User.countDocuments({
            mentorId: mentorObjectId,
            role: 'user',
            isActive: true,
        });

        // TODO: Count pending validations from UserSkill model
        // const pendingValidationsCount = await UserSkill.countDocuments({
        //   userId: { $in: userIds },
        //   status: 'pending_validation',
        // });

        return {
            assignedUsersCount,
            pendingValidationsCount: 0, // Placeholder
        };

    } catch (error) {
        console.error('Error in getMentorWorkload:', error);
        return {
            assignedUsersCount: 0,
            pendingValidationsCount: 0,
        };
    }
}
