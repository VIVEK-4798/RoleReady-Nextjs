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
import { sendNotifications } from '@/lib/services/notificationService';

interface RouteParams {
  params: Promise<{ userSkillId: string }>;
}

// Helper type for populated skill
interface PopulatedSkill {
  _id: string;
  name: string;
  domain: string;
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

    // Determine validation recipients for notification routing
    const { getValidationRecipients } = await import('@/lib/services/validationRoutingService');
    const recipients = await getValidationRecipients(user.id);

    // Cast to any because populate type inference can be tricky
    const skillName = (userSkill.skillId as any)?.name || 'a skill';

    // Send notifications based on routing
    if (recipients.recipientType === 'mentor') {
      // Notify assigned mentor
      await sendNotifications(
        recipients.recipientIds,
        'validation_request',
        {
          title: 'New Validation Request',
          message: `${user.name} has requested validation for "${skillName}"`,
          actionUrl: `/mentor/validation-queue`,
          metadata: {
            skillId: userSkill._id,
            userId: user.id
          }
        }
      );
    } else {
      // Notify admins
      await sendNotifications(
        recipients.recipientIds,
        'validation_request',
        {
          title: 'Unassigned Validation Request',
          message: `${user.name} (unassigned) requested validation for "${skillName}"`,
          actionUrl: `/admin/users?filter=pending`,
          metadata: {
            skillId: userSkill._id,
            userId: user.id
          }
        }
      );
    }

    return successResponse(
      {
        userSkill: {
          _id: userSkill._id,
          skillId: userSkill.skillId,
          level: userSkill.level,
          source: userSkill.source,
          validationStatus: userSkill.validationStatus,
        },
        message: recipients.recipientType === 'mentor'
          ? 'Your request has been sent to your assigned mentor.'
          : 'Your request has been sent to the admin team for assignment.',
        routing: {
          type: recipients.recipientType
        }
      },
      'Validation requested successfully'
    );
  } catch (error) {
    console.error('POST /api/users/skills/[userSkillId]/request-validation error:', error);
    return errors.serverError('Failed to request validation');
  }
}
