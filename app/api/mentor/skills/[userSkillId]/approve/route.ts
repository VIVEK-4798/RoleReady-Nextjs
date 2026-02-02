/**
 * Mentor Skill Approval API
 * 
 * POST /api/mentor/skills/[userSkillId]/approve
 * 
 * Approve a user's skill claim.
 * - Updates validationStatus to 'validated'
 * - Sets source to 'validated'
 * - Records validatedBy, validatedAt, and optional note
 * - Triggers readiness_outdated notification for user
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { UserSkill, User, Notification } from '@/lib/models';
import { successResponse, errors } from '@/lib/utils/api';
import { requireMentorApi } from '@/lib/auth/utils';
import { isValidObjectId } from '@/lib/utils/db';
import { Types } from 'mongoose';

interface RouteParams {
  params: Promise<{ userSkillId: string }>;
}

/**
 * POST /api/mentor/skills/[userSkillId]/approve
 * 
 * Body:
 * - note: Optional validation note/feedback
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userSkillId } = await params;

    // Validate ID format
    if (!isValidObjectId(userSkillId)) {
      return errors.badRequest('Invalid skill ID');
    }

    // Check mentor role
    const { user, error } = await requireMentorApi();
    if (error) return error;
    if (!user?.id) return errors.unauthorized('Authentication required');

    await connectDB();

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { note } = body as { note?: string };

    // Find the user skill
    const userSkill = await UserSkill.findById(userSkillId)
      .populate('userId', 'name email assignedMentor')
      .populate('skillId', 'name domain');

    if (!userSkill) {
      return errors.notFound('User skill');
    }

    // Cannot validate own skills
    if (userSkill.userId._id.toString() === user.id) {
      return errors.forbidden('Cannot validate your own skills');
    }

    // Check authorization: admin can validate anyone, mentor only assigned users
    if (user.role !== 'admin') {
      const skillOwner = userSkill.userId as unknown as { 
        _id: Types.ObjectId; 
        assignedMentor?: Types.ObjectId;
      };
      
      if (!skillOwner.assignedMentor || 
          skillOwner.assignedMentor.toString() !== user.id) {
        return errors.forbidden('You are not assigned to validate this user\'s skills');
      }
    }

    // Check if skill is in a valid state for approval
    if (userSkill.validationStatus === 'validated') {
      return errors.badRequest('Skill is already validated');
    }

    // Update the skill
    userSkill.validationStatus = 'validated';
    userSkill.source = 'validated'; // Mark as validated source
    userSkill.validatedBy = new Types.ObjectId(user.id);
    userSkill.validatedAt = new Date();
    if (note) {
      userSkill.validationNote = note;
    }

    await userSkill.save();

    // Create readiness_outdated notification for the user
    await Notification.createOrUpdate(
      userSkill.userId._id,
      'readiness_outdated',
      {
        title: 'Skill Validated!',
        message: `Your ${(userSkill.skillId as unknown as { name: string }).name} skill has been validated by a mentor. Recalculate your readiness to see updated scores.`,
        actionUrl: '/dashboard/readiness',
        metadata: {
          userSkillId: userSkill._id.toString(),
          skillName: (userSkill.skillId as unknown as { name: string }).name,
          mentorId: user.id,
          mentorName: user.name,
          action: 'approved',
        },
      }
    );

    // Also send mentor_validation notification
    await Notification.createOrUpdate(
      userSkill.userId._id,
      'mentor_validation',
      {
        title: 'Skill Approved',
        message: `${user.name} approved your ${(userSkill.skillId as unknown as { name: string }).name} skill${note ? `: "${note}"` : '.'}`,
        actionUrl: '/dashboard/skills',
        metadata: {
          userSkillId: userSkill._id.toString(),
          skillName: (userSkill.skillId as unknown as { name: string }).name,
          mentorId: user.id,
          mentorName: user.name,
          validationNote: note,
          action: 'approved',
        },
      }
    );

    return successResponse(
      {
        userSkill: {
          _id: userSkill._id,
          validationStatus: userSkill.validationStatus,
          source: userSkill.source,
          validatedBy: user.id,
          validatedAt: userSkill.validatedAt,
          validationNote: userSkill.validationNote,
        },
        notification: 'User has been notified about the approval',
        recommendation: 'User should recalculate readiness to reflect validated skill',
      },
      'Skill approved successfully'
    );
  } catch (error) {
    console.error('POST /api/mentor/skills/[userSkillId]/approve error:', error);
    return errors.serverError('Failed to approve skill');
  }
}
