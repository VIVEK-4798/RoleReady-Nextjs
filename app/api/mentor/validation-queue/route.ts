/**
 * Mentor Validation Queue API
 * 
 * GET /api/mentor/validation-queue
 * 
 * Returns pending skills that the mentor can validate.
 * - Admins can see all pending skills
 * - Mentors can only see skills from users assigned to them
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { UserSkill, User } from '@/lib/models';
import { successResponse, errors } from '@/lib/utils/api';
import { requireMentorApi } from '@/lib/auth/utils';
import { Types } from 'mongoose';

/**
 * GET /api/mentor/validation-queue
 * 
 * Query params:
 * - status: Filter by validation status (default: 'pending', options: 'pending', 'none', 'all')
 * - userId: Filter by specific user ID (optional)
 */
export async function GET(request: NextRequest) {
  try {
    // Check mentor role
    const { user, error } = await requireMentorApi();
    if (error) return error;
    if (!user?.id) return errors.unauthorized('Authentication required');

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const userIdFilter = searchParams.get('userId');

    // Build query for skills pending validation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    // Filter by validation status
    if (status === 'all') {
      query.validationStatus = { $in: ['none', 'pending'] };
    } else if (status === 'none') {
      query.validationStatus = 'none';
    } else {
      // Default: pending
      query.validationStatus = 'pending';
    }

    // Only include skills from self or resume (not already validated)
    query.source = { $in: ['self', 'resume'] };

    // Mentor cannot validate their own skills
    query.userId = { $ne: new Types.ObjectId(user.id) };

    // If not admin, can only see skills from assigned users
    if (user.role !== 'admin') {
      // Get users assigned to this mentor
      const assignedUsers = await User.find({
        assignedMentor: new Types.ObjectId(user.id),
        isActive: true,
      }).select('_id');

      const assignedUserIds = assignedUsers.map((u) => u._id);

      if (assignedUserIds.length === 0) {
        // No users assigned to this mentor
        return successResponse({
          queue: [],
          totalCount: 0,
          message: 'No users assigned to you for validation',
        });
      }

      query.userId = { 
        $in: assignedUserIds,
        $ne: new Types.ObjectId(user.id), // Still exclude mentor's own skills
      };
    }

    // Filter by specific user if provided
    if (userIdFilter) {
      const targetUserId = new Types.ObjectId(userIdFilter);
      
      // If mentor (not admin), verify they have access to this user
      if (user.role !== 'admin') {
        const hasAccess = await User.exists({
          _id: targetUserId,
          assignedMentor: new Types.ObjectId(user.id),
        });

        if (!hasAccess) {
          return errors.forbidden('You do not have access to validate this user\'s skills');
        }
      }

      query.userId = targetUserId;
    }

    // Fetch skills with user and skill details
    const pendingSkills = await UserSkill.find(query)
      .populate('userId', 'name email image')
      .populate('skillId', 'name domain description')
      .sort({ createdAt: -1 });

    // Group by user for better UX
    const groupedByUser = pendingSkills.reduce((acc, skill) => {
      const userId = skill.userId?._id?.toString();
      if (!userId) return acc;

      if (!acc[userId]) {
        acc[userId] = {
          user: skill.userId,
          skills: [],
        };
      }
      acc[userId].skills.push({
        _id: skill._id,
        skill: skill.skillId,
        level: skill.level,
        source: skill.source,
        validationStatus: skill.validationStatus,
        createdAt: skill.createdAt,
      });
      return acc;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as Record<string, { user: any; skills: any[] }>);

    return successResponse({
      queue: Object.values(groupedByUser),
      totalCount: pendingSkills.length,
      ungrouped: pendingSkills, // Also provide flat list
    });
  } catch (error) {
    console.error('GET /api/mentor/validation-queue error:', error);
    return errors.serverError('Failed to fetch validation queue');
  }
}
