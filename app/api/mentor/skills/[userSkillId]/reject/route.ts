/**
 * Mentor Skill Rejection API
 * 
 * POST /api/mentor/skills/[userSkillId]/reject
 * 
 * Reject a user's skill claim.
 * - Updates validationStatus to 'rejected'
 * - Records validatedBy, validatedAt, and required note explaining rejection
 * - Triggers readiness_outdated notification for user
 * - Triggers roadmap regeneration recommendation
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { UserSkill, Notification } from '@/lib/models';
import { successResponse, errors } from '@/lib/utils/api';
import { requireMentorApi } from '@/lib/auth/utils';
import { isValidObjectId } from '@/lib/utils/db';
import { Types } from 'mongoose';

interface RouteParams {
  params: Promise<{ userSkillId: string }>;
}

/**
 * POST /api/mentor/skills/[userSkillId]/reject
 * 
 * Body:
 * - note: Required - reason for rejection/feedback for improvement
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
    let body: { note?: string } = {};
    try {
      body = await request.json();
    } catch {
      return errors.badRequest('Invalid request body');
    }

    const { note } = body;

    // Rejection requires a note explaining why
    if (!note || note.trim().length === 0) {
      return errors.validationError('Rejection note is required');
    }

    if (note.length > 500) {
      return errors.validationError('Rejection note cannot exceed 500 characters');
    }

    // Find the user skill
    const userSkill = await UserSkill.findById(userSkillId)
      .populate('userId', 'name email assignedMentor')
      .populate('skillId', 'name domain');

    if (!userSkill) {
      return errors.notFound('User skill');
    }

    // Cannot reject own skills
    if (userSkill.userId._id.toString() === user.id) {
      return errors.forbidden('Cannot reject your own skills');
    }

    // Check authorization: admin can reject anyone, mentor only assigned users
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

    // Check if skill is in a valid state for rejection
    if (userSkill.validationStatus === 'rejected') {
      return errors.badRequest('Skill is already rejected');
    }

    if (userSkill.validationStatus === 'validated') {
      return errors.badRequest('Cannot reject an already validated skill');
    }

    // Update the skill
    userSkill.validationStatus = 'rejected';
    userSkill.validatedBy = new Types.ObjectId(user.id);
    userSkill.validatedAt = new Date();
    userSkill.validationNote = note.trim();
    // Note: source remains as 'self' or 'resume' - not changed on rejection

    await userSkill.save();

    const skillName = (userSkill.skillId as unknown as { name: string }).name;

    // Create readiness_outdated notification for the user
    await Notification.createOrUpdate(
      userSkill.userId._id,
      'readiness_outdated',
      {
        title: 'Skill Validation Update',
        message: `Your ${skillName} skill was not approved. Recalculate your readiness and consider regenerating your roadmap.`,
        actionUrl: '/dashboard/readiness',
        metadata: {
          userSkillId: userSkill._id.toString(),
          skillName,
          mentorId: user.id,
          mentorName: user.name,
          action: 'rejected',
          recommendRoadmapRegeneration: true,
        },
      }
    );

    // Send mentor_validation notification with feedback
    await Notification.createOrUpdate(
      userSkill.userId._id,
      'mentor_validation',
      {
        title: 'Skill Needs Improvement',
        message: `${user.name} reviewed your ${skillName} skill: "${note}"`,
        actionUrl: '/dashboard/skills',
        metadata: {
          userSkillId: userSkill._id.toString(),
          skillName,
          mentorId: user.id,
          mentorName: user.name,
          validationNote: note,
          action: 'rejected',
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
        notification: 'User has been notified about the rejection',
        recommendation: 'User should recalculate readiness and consider regenerating roadmap',
      },
      'Skill rejected with feedback'
    );
  } catch (error) {
    console.error('POST /api/mentor/skills/[userSkillId]/reject error:', error);
    return errors.serverError('Failed to reject skill');
  }
}
