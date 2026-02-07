/**
 * Mentor Validation Queue API
 * 
 * GET /api/mentor/validation-queue
 * 
 * Returns pending skills that the mentor can validate.
 * - All mentors and admins can see all pending skills from any user
 * - Mentors cannot validate their own skills
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { UserSkill } from '@/lib/models';
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

    // Filter by specific user if provided
    if (userIdFilter) {
      query.userId = new Types.ObjectId(userIdFilter);
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
