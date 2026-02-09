/**
 * User Skills API Routes
 * 
 * GET /api/users/[id]/skills - Get user's skills with proficiency levels
 * POST /api/users/[id]/skills - Add a skill to user's profile
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { UserSkill, Skill, TargetRole, Notification, ActivityLog } from '@/lib/models';
import { success, errors, handleError, getPaginationParams } from '@/lib/utils/api';
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
  params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id]/skills
 * Get all skills for a user with proficiency levels
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin' && sessionUser.role !== 'mentor') {
      return errors.forbidden('You can only access your own skills');
    }

    const { page, limit, skip } = getPaginationParams(request.url);
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const validationStatus = searchParams.get('validationStatus');

    await connectDB();

    // Build query
    const query: Record<string, unknown> = { userId: id };
    if (validationStatus) {
      query.validationStatus = validationStatus;
    }

    // Get user skills with populated skill data
    const userSkillsQuery = UserSkill.find(query)
      .populate({
        path: 'skillId',
        select: 'name normalizedName domain description',
        match: domain ? { domain } : undefined,
      })
      .sort({ level: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const [userSkills, total] = await Promise.all([
      userSkillsQuery.exec(),
      UserSkill.countDocuments(query),
    ]);

    // Filter out skills where populate didn't match (domain filter)
    const filteredSkills = userSkills.filter((us) => us.skillId !== null);

    // Transform response
    const skills = filteredSkills.map((us) => {
      const skill = us.skillId as unknown as PopulatedSkill;
      return {
        _id: us._id.toString(),
        id: us._id,
        skillId: skill._id,
        skillName: skill.name, // Frontend expects skillName
        name: skill.name,
        domain: skill.domain,
        category: skill.domain, // Map domain to category for frontend compatibility
        description: skill.description,
        level: us.level,
        proficiency: us.level === 'expert' ? 90 : us.level === 'advanced' ? 70 : us.level === 'intermediate' ? 50 : 30, // Map level to proficiency percentage
        source: us.source,
        isVerified: us.validationStatus === 'validated',
        validationStatus: us.validationStatus,
        validatedBy: us.validatedBy,
        validatedAt: us.validatedAt,
        rejectionReason: us.rejectionReason,
      };
    });

    return success({
      skills,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/users/[id]/skills
 * Add a skill to user's profile
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only add skills to your own profile');
    }

    const body = await request.json();

    // Validate required fields
    if (!body.skillId && !body.skillName) {
      return errors.badRequest('Either skillId or skillName is required');
    }

    await connectDB();

    let skillId = body.skillId;

    // If skillName provided instead of skillId, find or create the skill
    if (!skillId && body.skillName) {
      let skill = await Skill.findOne({
        normalizedName: body.skillName.toLowerCase().trim().replace(/\s+/g, '-'),
      });

      if (!skill) {
        // Create new skill
        skill = await Skill.create({
          name: body.skillName.trim(),
          domain: body.domain || 'other',
          description: body.description,
        });
      }

      skillId = skill._id;
    }

    // Check if user already has this skill
    const existingUserSkill = await UserSkill.findOne({
      userId: id,
      skillId,
    });

    if (existingUserSkill) {
      return errors.badRequest('You already have this skill in your profile');
    }

    // Create user skill
    const proficiency = body.proficiency || 50;
    const level = proficiency >= 90 ? 'expert' : proficiency >= 70 ? 'advanced' : proficiency >= 50 ? 'intermediate' : 'beginner';
    
    const userSkill = await UserSkill.create({
      userId: id,
      skillId,
      level,
      source: body.source || 'self',
    });

    // Log activity for contribution graph
    await ActivityLog.logActivity(id, 'user', 'skill_added', {
      skillId: skillId.toString(),
      userSkillId: userSkill._id.toString(),
    });

    // Trigger readiness_outdated notification if user has a target role
    const targetRole = await TargetRole.getActiveForUser(id);
    if (targetRole) {
      await Notification.createOrUpdate(id, 'readiness_outdated', {
        title: 'Readiness outdated',
        message: 'Your skills have changed. Recalculate your readiness score.',
        metadata: { reason: 'skill_added' },
      });
    }

    // Populate skill data for response
    await userSkill.populate('skillId', 'name normalizedName domain');

    const skill = userSkill.skillId as unknown as PopulatedSkill;

    return success({
      id: userSkill._id,
      skillId: skill._id,
      name: skill.name,
      domain: skill.domain,
      category: skill.domain, // Map domain to category for frontend compatibility
      level: userSkill.level,
      proficiency: userSkill.level === 'expert' ? 90 : userSkill.level === 'advanced' ? 70 : userSkill.level === 'intermediate' ? 50 : 30,
      source: userSkill.source,
      isVerified: userSkill.validationStatus === 'validated',
    }, 'Skill added successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}
