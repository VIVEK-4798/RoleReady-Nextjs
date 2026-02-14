/**
 * Mentor Queue Service
 * 
 * Handles mentor-specific validation queues with strict ownership filtering.
 * 
 * CORE PRINCIPLE:
 * Mentors ONLY see validations from users assigned to them (user.mentorId === mentorId)
 * Admins see validations from unassigned users (user.mentorId === null)
 */

import { Types } from 'mongoose';
import dbConnect from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import UserSkill from '@/lib/models/UserSkill';
import Role from '@/lib/models/Role';
import TargetRole from '@/lib/models/TargetRole';

// ============================================================================
// Types
// ============================================================================

export interface PendingValidation {
    _id: string;
    userId: string;
    userName: string;
    userEmail: string;
    skillId: string;
    skillName: string;
    skillDomain: string;
    level: string;
    source: string;
    validationStatus: string;
    requestedAt: Date;
}

// ============================================================================
// Mentor Queue
// ============================================================================

/**
 * Get pending validations for a specific mentor
 * 
 * STRICT FILTERING: Only returns validations from users where user.mentorId === mentorId
 * 
 * @param mentorId - Mentor ID
 * @returns Array of pending validations from assigned users only
 */
export async function getPendingValidationsForMentor(
    mentorId: string | Types.ObjectId
): Promise<PendingValidation[]> {
    try {
        await dbConnect();

        const mentorObjectId = typeof mentorId === 'string' ? new Types.ObjectId(mentorId) : mentorId;

        // Step 1: Get all users assigned to this mentor
        const assignedUsers = await User.find({
            mentorId: mentorObjectId,
            role: 'user',
            isActive: true,
        })
            .select('_id')
            .lean();

        const assignedUserIds = assignedUsers.map(u => u._id);

        if (assignedUserIds.length === 0) {
            return []; // No assigned users, no validations to show
        }

        // Step 2: Get pending validations ONLY from assigned users
        const pendingSkills = await UserSkill.find({
            userId: { $in: assignedUserIds },
            validationStatus: { $in: ['none', 'pending'] },
            source: { $in: ['self', 'resume'] },
        })
            .populate('userId', 'name email')
            .populate('skillId', 'name domain')
            .sort({ createdAt: -1 })
            .lean();

        // Step 3: Transform to response format
        return pendingSkills.map(skill => ({
            _id: skill._id.toString(),
            userId: (skill.userId as any)._id.toString(),
            userName: (skill.userId as any).name,
            userEmail: (skill.userId as any).email,
            skillId: (skill.skillId as any)._id.toString(),
            skillName: (skill.skillId as any).name,
            skillDomain: (skill.skillId as any).domain || 'General',
            level: skill.level,
            source: skill.source,
            validationStatus: skill.validationStatus,
            requestedAt: skill.createdAt,
        }));

    } catch (error) {
        console.error('Error in getPendingValidationsForMentor:', error);
        return [];
    }
}

// ============================================================================
// Admin Queue
// ============================================================================

/**
 * Get pending validations for admin queue
 * 
 * STRICT FILTERING: Only returns validations from users where user.mentorId === null
 * 
 * @returns Array of pending validations from unassigned users only
 */
export async function getPendingValidationsForAdmin(): Promise<PendingValidation[]> {
    try {
        await dbConnect();

        // Step 1: Get all users WITHOUT assigned mentor
        const unassignedUsers = await User.find({
            mentorId: null,
            role: 'user',
            isActive: true,
        })
            .select('_id')
            .lean();

        const unassignedUserIds = unassignedUsers.map(u => u._id);

        if (unassignedUserIds.length === 0) {
            return []; // All users are assigned, no admin queue
        }

        // Step 2: Get pending validations ONLY from unassigned users
        const pendingSkills = await UserSkill.find({
            userId: { $in: unassignedUserIds },
            validationStatus: { $in: ['none', 'pending'] },
            source: { $in: ['self', 'resume'] },
        })
            .populate('userId', 'name email')
            .populate('skillId', 'name domain')
            .sort({ createdAt: -1 })
            .lean();

        // Step 3: Transform to response format
        return pendingSkills.map(skill => ({
            _id: skill._id.toString(),
            userId: (skill.userId as any)._id.toString(),
            userName: (skill.userId as any).name,
            userEmail: (skill.userId as any).email,
            skillId: (skill.skillId as any)._id.toString(),
            skillName: (skill.skillId as any).name,
            skillDomain: (skill.skillId as any).domain || 'General',
            level: skill.level,
            source: skill.source,
            validationStatus: skill.validationStatus,
            requestedAt: skill.createdAt,
        }));

    } catch (error) {
        console.error('Error in getPendingValidationsForAdmin:', error);
        return [];
    }
}

// ============================================================================
// Grouped Validation Queue (Inbox View)
// ============================================================================

export interface GroupedMentorQueueItem {
    userId: string;
    name: string;
    email: string;
    image?: string;
    targetRole?: string;
    pendingCount: number;
    oldestPendingAt: Date;
}

/**
 * Get users assigned to a mentor who have pending validations.
 * Grouped by user for the "Inbox" view.
 */
export async function getUsersWithPendingValidations(
    mentorId: string | Types.ObjectId
): Promise<GroupedMentorQueueItem[]> {
    try {
        await dbConnect();
        const mentorObjectId = typeof mentorId === 'string' ? new Types.ObjectId(mentorId) : mentorId;

        // Use aggregation for efficiency
        const groupedResults = await UserSkill.aggregate([
            // 1. Filter only pending validations
            {
                $match: {
                    validationStatus: 'pending',
                }
            },
            // 2. Join with users
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            // 3. Filter by mentorId
            {
                $match: {
                    'user.mentorId': mentorObjectId
                }
            },
            // 4. Robust Target Role ID Conversion from Profile
            {
                $addFields: {
                    targetRoleIdFromProfile: {
                        $cond: {
                            if: { $eq: [{ $type: "$user.profile.targetRoleId" }, "string"] },
                            then: { $toObjectId: "$user.profile.targetRoleId" },
                            else: "$user.profile.targetRoleId"
                        }
                    }
                }
            },
            // 5. Join with roles directly (from user profile)
            {
                $lookup: {
                    from: 'roles',
                    localField: 'targetRoleIdFromProfile',
                    foreignField: '_id',
                    as: 'roleFromProfile'
                }
            },
            // 6. Backup: Join via TargetRole collection
            {
                $lookup: {
                    from: 'targetroles',
                    let: { uId: "$user._id" },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ["$userId", "$$uId"] }, { $eq: ["$isActive", true] }] } } },
                        { $lookup: { from: 'roles', localField: 'roleId', foreignField: '_id', as: 'roleDoc' } },
                        { $unwind: '$roleDoc' },
                        { $project: { name: '$roleDoc.name' } }
                    ],
                    as: 'roleFromCollection'
                }
            },
            // 7. Group by user
            {
                $group: {
                    _id: '$userId',
                    name: { $first: '$user.name' },
                    email: { $first: '$user.email' },
                    image: { $first: '$user.image' },
                    // Priority: profile field > separate collection
                    targetRole: {
                        $first: {
                            $cond: {
                                if: { $gt: [{ $size: "$roleFromProfile" }, 0] },
                                then: { $arrayElemAt: ["$roleFromProfile.name", 0] },
                                else: {
                                    $cond: {
                                        if: { $gt: [{ $size: "$roleFromCollection" }, 0] },
                                        then: { $arrayElemAt: ["$roleFromCollection.name", 0] },
                                        else: 'Not Set'
                                    }
                                }
                            }
                        }
                    },
                    pendingCount: { $sum: 1 },
                    oldestPendingAt: { $min: '$createdAt' }
                }
            },
            // 8. Sort by oldest pending first (SLA priority)
            {
                $sort: { oldestPendingAt: 1 }
            }
        ]);

        return groupedResults.map(item => ({
            userId: item._id.toString(),
            name: item.name,
            email: item.email,
            image: item.image,
            targetRole: item.targetRole,
            pendingCount: item.pendingCount,
            oldestPendingAt: item.oldestPendingAt
        }));

    } catch (error) {
        console.error('Error in getUsersWithPendingValidations:', error);
        return [];
    }
}

/**
 * Get all pending skills for a specific user assigned to a mentor.
 * Used for the "Conversation" view.
 */
export async function getPendingSkillsForUser(
    mentorId: string | Types.ObjectId,
    userId: string
): Promise<{ user: any; skills: PendingValidation[] }> {
    try {
        await dbConnect();
        const mentorObjectId = typeof mentorId === 'string' ? new Types.ObjectId(mentorId) : mentorId;
        const userObjectId = new Types.ObjectId(userId);

        // Fetch user with role populated
        const userDoc = await User.findOne({
            _id: userObjectId,
            mentorId: mentorObjectId
        })
            .select('name email image profile.targetRoleId')
            .populate({
                path: 'profile.targetRoleId',
                model: 'Role',
                select: 'name'
            })
            .lean();

        if (!userDoc) {
            throw new Error('User not found or not assigned to this mentor');
        }

        // Fetch pending skills
        const skills = await UserSkill.find({
            userId: userObjectId,
            validationStatus: 'pending'
        })
            .populate({
                path: 'skillId',
                populate: { path: 'domain', select: 'name' }
            })
            .sort({ createdAt: 1 }) // Oldest first for SLA
            .lean();

        const formattedSkills = skills.map((skill: any) => ({
            _id: skill._id.toString(),
            userId: userDoc._id.toString(),
            userName: userDoc.name,
            userEmail: userDoc.email,
            skillId: skill.skillId._id.toString(),
            skillName: skill.skillId.name,
            skillDomain: skill.skillId.domain?.name || 'General',
            level: skill.level,
            source: skill.source,
            validationStatus: skill.validationStatus,
            requestedAt: skill.createdAt,
        }));

        // Resolve Target Role Name (Priority: Profile > Collection)
        let targetRoleName = 'Not Set';

        // 1. Check Profile
        if (userDoc.profile?.targetRoleId) {
            const role = await Role.findById(userDoc.profile.targetRoleId).select('name').lean();
            if (role) targetRoleName = (role as any).name;
        }

        // 2. Fallback to TargetRole collection if still Not Set
        if (targetRoleName === 'Not Set') {
            const activeTarget = await TargetRole.getActiveForUser(userObjectId);
            if (activeTarget && (activeTarget as any).roleId?.name) {
                targetRoleName = (activeTarget as any).roleId.name;
            }
        }

        return {
            user: {
                id: userDoc._id.toString(),
                name: userDoc.name,
                email: userDoc.email,
                image: userDoc.image,
                targetRole: targetRoleName
            },
            skills: formattedSkills
        };

    } catch (error) {
        console.error('Error in getPendingSkillsForUser:', error);
        throw error;
    }
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Get validation statistics for a mentor
 * 
 * @param mentorId - Mentor ID
 * @returns Counts of pending, validated, and rejected validations
 */
export async function getMentorValidationStats(
    mentorId: string | Types.ObjectId
): Promise<{
    pending: number;
    validated: number;
    rejected: number;
    total: number;
    assignedStudents: number;
}> {
    try {
        await dbConnect();

        const mentorObjectId = typeof mentorId === 'string' ? new Types.ObjectId(mentorId) : mentorId;

        // Get assigned users
        const assignedUsers = await User.find({
            mentorId: mentorObjectId,
            role: 'user',
            isActive: true,
        })
            .select('_id')
            .lean();

        const assignedUserIds = assignedUsers.map(u => u._id);

        if (assignedUserIds.length === 0) {
            return { pending: 0, validated: 0, rejected: 0, total: 0, assignedStudents: 0 };
        }

        // Count by status
        const [pending, validated, rejected] = await Promise.all([
            UserSkill.countDocuments({
                userId: { $in: assignedUserIds },
                validationStatus: 'pending',
            }),
            UserSkill.countDocuments({
                userId: { $in: assignedUserIds },
                validationStatus: 'validated',
                validatedBy: mentorObjectId,
            }),
            UserSkill.countDocuments({
                userId: { $in: assignedUserIds },
                validationStatus: 'rejected',
                validatedBy: mentorObjectId,
            }),
        ]);

        return {
            pending,
            validated,
            rejected,
            total: validated + rejected, // Processed = Validated + Rejected
            assignedStudents: assignedUserIds.length,
        };

    } catch (error) {
        console.error('Error in getMentorValidationStats:', error);
        return { pending: 0, validated: 0, rejected: 0, total: 0, assignedStudents: 0 };
    }
}
