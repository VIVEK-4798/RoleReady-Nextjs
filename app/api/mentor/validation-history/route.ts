/**
 * Mentor Validation History API
 * 
 * GET /api/mentor/validation-history
 * 
 * Returns skills that the mentor has validated (approved or rejected).
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { UserSkill } from '@/lib/models';
import { successResponse, paginatedResponse, errors } from '@/lib/utils/api';
import { requireMentorApi } from '@/lib/auth/utils';
import { parsePaginationParams, createPagination } from '@/lib/utils/db';
import { Types } from 'mongoose';

/**
 * GET /api/mentor/validation-history
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - status: Filter by validation status ('validated', 'rejected', or 'all')
 */
export async function GET(request: NextRequest) {
  try {
    // Check mentor role
    const { user, error } = await requireMentorApi();
    if (error) return error;
    if (!user?.id) return errors.unauthorized('Authentication required');

    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePaginationParams(searchParams, { page: 1, limit: 20 });
    const status = searchParams.get('status') || 'all';

    // Build query - skills validated by this mentor
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {
      validatedBy: new Types.ObjectId(user.id),
    };

    if (status === 'validated') {
      query.validationStatus = 'validated';
    } else if (status === 'rejected') {
      query.validationStatus = 'rejected';
    } else {
      // All validated skills (approved or rejected)
      query.validationStatus = { $in: ['validated', 'rejected'] };
    }

    // Execute query with pagination
    const [skills, totalItems] = await Promise.all([
      UserSkill.find(query)
        .populate('userId', 'name email image')
        .populate('skillId', 'name domain')
        .skip(skip)
        .limit(limit)
        .sort({ validatedAt: -1 }),
      UserSkill.countDocuments(query),
    ]);

    const pagination = createPagination(page, limit, totalItems);

    // Transform to include formatted data
    const formattedSkills = skills.map((skill) => ({
      _id: skill._id,
      user: skill.userId,
      skill: skill.skillId,
      level: skill.level,
      source: skill.source,
      validationStatus: skill.validationStatus,
      validatedAt: skill.validatedAt,
      validationNote: skill.validationNote,
    }));

    return paginatedResponse(formattedSkills, pagination);
  } catch (error) {
    console.error('GET /api/mentor/validation-history error:', error);
    return errors.serverError('Failed to fetch validation history');
  }
}
