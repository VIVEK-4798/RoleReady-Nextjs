/**
 * Single User Skill API Routes
 * 
 * GET /api/users/[id]/skills/[skillId] - Get single user skill
 * PUT /api/users/[id]/skills/[skillId] - Update user skill (proficiency, etc.)
 * DELETE /api/users/[id]/skills/[skillId] - Remove skill from user profile
 */

import { NextRequest } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/db/mongoose';
import { UserSkill, TargetRole, Notification, ActivityLog } from '@/lib/models';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';

// Type for populated skillId
interface PopulatedSkill {
  _id: string;
  name: string;
  normalizedName: string;
  domain: string;
  description?: string;
}

interface RouteContext {
  params: Promise<{ id: string; skillId: string }>;
}

/**
 * GET /api/users/[id]/skills/[skillId]
 * Get a single user skill with details
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id, skillId } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin' && sessionUser.role !== 'mentor') {
      return errors.forbidden('You can only access your own skills');
    }

    await connectDB();

    const userSkill = await UserSkill.findOne({
      _id: skillId,
      userId: id,
    }).populate('skillId', 'name normalizedName domain description');

    if (!userSkill) {
      return errors.notFound('Skill not found in your profile');
    }

    const skill = userSkill.skillId as unknown as PopulatedSkill;

    return success({
      id: userSkill._id,
      skillId: skill._id,
      name: skill.name,
      domain: skill.domain,
      category: skill.domain,
      description: skill.description,
      level: userSkill.level,
      proficiency: userSkill.level === 'expert' ? 90 : userSkill.level === 'advanced' ? 70 : userSkill.level === 'intermediate' ? 50 : 30,
      source: userSkill.source,
      isVerified: userSkill.validationStatus === 'validated',
      validationStatus: userSkill.validationStatus,
      validatedBy: userSkill.validatedBy,
      validatedAt: userSkill.validatedAt,
      createdAt: userSkill.createdAt,
      updatedAt: userSkill.updatedAt,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/users/[id]/skills/[skillId]
 * Update a user skill (level, validation status, etc.)
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id, skillId } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    const isOwner = sessionUser.id === id;
    const isMentorOrAdmin = sessionUser.role === 'admin' || sessionUser.role === 'mentor';

    if (!isOwner && !isMentorOrAdmin) {
      return errors.forbidden('You can only update your own skills');
    }

    const body = await request.json();

    await connectDB();

    const userSkill = await UserSkill.findOne({
      _id: skillId,
      userId: id,
    });

    if (!userSkill) {
      return errors.notFound('Skill not found in your profile');
    }

    // Update fields that the owner can update
    if (isOwner || isMentorOrAdmin) {
      if (body.level !== undefined) {
        userSkill.level = body.level;
      }
      // Also accept proficiency percentage and convert to level
      if (body.proficiency !== undefined) {
        const proficiency = body.proficiency;
        userSkill.level = proficiency >= 90 ? 'expert' : proficiency >= 70 ? 'advanced' : proficiency >= 50 ? 'intermediate' : 'beginner';
      }
    }

    // Only mentors/admins can validate skills
    if (isMentorOrAdmin && body.validationStatus !== undefined) {
      userSkill.validationStatus = body.validationStatus;
      if (body.validationStatus === 'validated' && sessionUser.id) {
        userSkill.validatedBy = new Types.ObjectId(sessionUser.id);
        userSkill.validatedAt = new Date();
        userSkill.source = 'validated';
      }
      if (body.validationNote !== undefined) {
        userSkill.validationNote = body.validationNote;
      }
    }

    await userSkill.save();

    // Log activity for contribution graph (only for owner updates)
    if (isOwner && body.level !== undefined) {
      await ActivityLog.logActivity(id, 'user', 'skill_updated', {
        userSkillId: userSkill._id.toString(),
        newLevel: body.level,
      });
    }

    // Trigger readiness_outdated notification if user has a target role
    const targetRole = await TargetRole.getActiveForUser(id);
    if (targetRole) {
      const notificationType = body.validationStatus !== undefined ? 'validation' : 'skill_update';
      await Notification.createOrUpdate(id, 'readiness_outdated', {
        title: 'Readiness outdated',
        message: body.validationStatus !== undefined
          ? 'Your skill validation has changed. Recalculate your readiness score.'
          : 'Your skill level has changed. Recalculate your readiness score.',
        metadata: { reason: notificationType },
      });
    }

    // Populate for response
    await userSkill.populate('skillId', 'name normalizedName domain');

    const skill = userSkill.skillId as unknown as PopulatedSkill;

    return success({
      id: userSkill._id,
      skillId: skill._id,
      name: skill.name,
      domain: skill.domain,
      category: skill.domain,
      level: userSkill.level,
      proficiency: userSkill.level === 'expert' ? 90 : userSkill.level === 'advanced' ? 70 : userSkill.level === 'intermediate' ? 50 : 30,
      source: userSkill.source,
      isVerified: userSkill.validationStatus === 'validated',
      validationStatus: userSkill.validationStatus,
      validatedBy: userSkill.validatedBy,
      validatedAt: userSkill.validatedAt,
    }, 'Skill updated successfully');
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/users/[id]/skills/[skillId]
 * Remove a skill from user's profile
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id, skillId } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only remove your own skills');
    }

    await connectDB();

    const userSkill = await UserSkill.findOneAndDelete({
      _id: skillId,
      userId: id,
    });

    if (!userSkill) {
      return errors.notFound('Skill not found in your profile');
    }

    // Trigger readiness_outdated notification if user has a target role
    const targetRole = await TargetRole.getActiveForUser(id);
    if (targetRole) {
      await Notification.createOrUpdate(id, 'readiness_outdated', {
        title: 'Readiness outdated',
        message: 'A skill was removed from your profile. Recalculate your readiness score.',
        metadata: { reason: 'skill_removed' },
      });
    }

    return success(null, 'Skill removed from profile');
  } catch (error) {
    return handleError(error);
  }
}
