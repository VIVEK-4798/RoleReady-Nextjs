/**
 * Bulk User Skills API Routes
 * 
 * POST /api/users/[id]/skills/bulk - Add multiple skills at once
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { UserSkill, Skill } from '@/lib/models';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';
import type { SkillLevel, SkillSource } from '@/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface SkillInput {
  skillId?: string;
  skillName?: string;
  domain?: string;
  level?: SkillLevel;
  source?: SkillSource;
}

/**
 * POST /api/users/[id]/skills/bulk
 * Add multiple skills at once (useful for resume import)
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

    if (!body.skills || !Array.isArray(body.skills) || body.skills.length === 0) {
      return errors.badRequest('Skills array is required');
    }

    if (body.skills.length > 50) {
      return errors.badRequest('Cannot add more than 50 skills at once');
    }

    await connectDB();

    const results = {
      added: [] as { name: string; id: string }[],
      skipped: [] as { name: string; reason: string }[],
      failed: [] as { name: string; error: string }[],
    };

    // Get existing user skills to avoid duplicates
    const existingUserSkills = await UserSkill.find({ userId: id }).select('skillId');
    const existingSkillIds = new Set(existingUserSkills.map((us) => us.skillId.toString()));

    for (const skillInput of body.skills as SkillInput[]) {
      try {
        let skillId = skillInput.skillId;
        let skillName = skillInput.skillName || '';

        // If skillName provided, find or create the skill
        if (!skillId && skillInput.skillName) {
          const normalizedName = skillInput.skillName.toLowerCase().trim().replace(/\s+/g, '-');
          let skill = await Skill.findOne({ normalizedName });

          if (!skill) {
            skill = await Skill.create({
              name: skillInput.skillName.trim(),
              domain: skillInput.domain || 'other',
            });
          }

          skillId = skill._id.toString();
          skillName = skill.name;
        } else if (skillId) {
          // Get skill name for reporting
          const skill = await Skill.findById(skillId);
          if (skill) {
            skillName = skill.name;
          }
        }

        if (!skillId) {
          results.failed.push({
            name: skillInput.skillName || 'Unknown',
            error: 'Could not resolve skill',
          });
          continue;
        }

        // Check for duplicate
        if (existingSkillIds.has(skillId)) {
          results.skipped.push({
            name: skillName,
            reason: 'Already in profile',
          });
          continue;
        }

        // Create user skill
        const userSkill = await UserSkill.create({
          userId: id,
          skillId,
          level: skillInput.level || 'beginner',
          source: skillInput.source || body.source || 'resume',
        });

        existingSkillIds.add(skillId);

        results.added.push({
          name: skillName,
          id: userSkill._id.toString(),
        });
      } catch (err) {
        results.failed.push({
          name: skillInput.skillName || skillInput.skillId || 'Unknown',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return success({
      summary: {
        added: results.added.length,
        skipped: results.skipped.length,
        failed: results.failed.length,
      },
      details: results,
    }, `Added ${results.added.length} skills`, 201);
  } catch (error) {
    return handleError(error);
  }
}
