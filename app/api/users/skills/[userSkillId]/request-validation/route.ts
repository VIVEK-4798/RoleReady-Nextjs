/**
 * User Skill Validation Request API
 * 
 * POST /api/users/skills/[userSkillId]/request-validation
 * 
 * Allows users to request mentor validation for their skills.
 * - Updates validationStatus from 'none' to 'pending'
 * - Only skill owner can request validation
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { UserSkill } from '@/lib/models';
import { successResponse, errors } from '@/lib/utils/api';
import { requireAuthApi } from '@/lib/auth/utils';
import { isValidObjectId } from '@/lib/utils/db';

interface RouteParams {
  params: Promise<{ userSkillId: string }>;
}

/**
 * POST /api/users/skills/[userSkillId]/request-validation
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userSkillId } = await params;

    // Validate ID format
    if (!isValidObjectId(userSkillId)) {
      return errors.badRequest('Invalid skill ID');
    }

    // Require authentication
    const { user, error } = await requireAuthApi();
    if (error) return error;
    if (!user?.id) return errors.unauthorized('Authentication required');

    await connectDB();

    // Find the user skill
    const userSkill = await UserSkill.findById(userSkillId)
      .populate('skillId', 'name domain');

    if (!userSkill) {
      return errors.notFound('User skill');
    }

    // Only the skill owner can request validation
    if (userSkill.userId.toString() !== user.id) {
      return errors.forbidden('You can only request validation for your own skills');
    }

    // Check if skill is in valid state for requesting validation
    if (userSkill.validationStatus === 'pending') {
      return errors.badRequest('Validation is already pending');
    }

    if (userSkill.validationStatus === 'validated') {
      return errors.badRequest('Skill is already validated');
    }

    // Update status to pending
    userSkill.validationStatus = 'pending';
    // Clear any previous validation data (in case of re-submission after rejection)
    userSkill.validatedBy = undefined;
    userSkill.validatedAt = undefined;
    userSkill.validationNote = undefined;

    await userSkill.save();

    return successResponse(
      {
        userSkill: {
          _id: userSkill._id,
          skillId: userSkill.skillId,
          level: userSkill.level,
          source: userSkill.source,
          validationStatus: userSkill.validationStatus,
        },
        message: 'Your skill is now pending validation by a mentor',
      },
      'Validation requested successfully'
    );
  } catch (error) {
    console.error('POST /api/users/skills/[userSkillId]/request-validation error:', error);
    return errors.serverError('Failed to request validation');
  }
}
