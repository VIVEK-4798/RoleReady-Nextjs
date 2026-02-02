/**
 * Resume Skill Sync API Route
 * 
 * POST /api/users/[id]/resume/[resumeId]/sync-skills - Sync parsed skills to user profile
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Resume, UserSkill, Skill } from '@/lib/models';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';
import type { SkillLevel } from '@/types';

interface RouteContext {
  params: Promise<{ id: string; resumeId: string }>;
}

/**
 * Convert a confidence score (0-100) to a skill level
 */
function confidenceToLevel(confidence: number): SkillLevel {
  if (confidence >= 90) return 'expert';
  if (confidence >= 70) return 'advanced';
  if (confidence >= 50) return 'intermediate';
  if (confidence >= 25) return 'beginner';
  return 'none';
}

/**
 * POST /api/users/[id]/resume/[resumeId]/sync-skills
 * Sync extracted skills from resume to user's skill profile
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id, resumeId } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only sync your own resume skills');
    }

    const body = await request.json();
    const { 
      overwriteExisting = false, 
      minConfidence = 50,
      selectedSkills // Optional: array of skill names to sync (if not provided, sync all)
    } = body;

    await connectDB();

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: id,
    });

    if (!resume) {
      return errors.notFound('Resume not found');
    }

    if (resume.status !== 'completed') {
      return errors.badRequest('Resume has not been parsed yet');
    }

    const extractedSkills = resume.extractedData?.skills || [];

    if (extractedSkills.length === 0) {
      return errors.badRequest('No skills found in resume');
    }

    // Filter by confidence and selected skills
    let skillsToSync = extractedSkills.filter(s => s.confidence >= minConfidence);
    
    if (selectedSkills && Array.isArray(selectedSkills)) {
      const selectedSet = new Set(selectedSkills.map((s: string) => s.toLowerCase()));
      skillsToSync = skillsToSync.filter(s => selectedSet.has(s.name.toLowerCase()));
    }

    const results = {
      added: [] as string[],
      updated: [] as string[],
      skipped: [] as string[],
      failed: [] as { name: string; error: string }[],
    };

    // Get existing user skills with populated skill info
    const existingUserSkills = await UserSkill.find({ userId: id }).populate('skillId', 'name normalizedName');
    
    // Type for populated skillId
    interface PopulatedSkill {
      _id: string;
      name: string;
      normalizedName: string;
    }
    
    const existingSkillMap = new Map(
      existingUserSkills.map(us => {
        const skill = us.skillId as unknown as PopulatedSkill;
        return [skill.normalizedName, us];
      })
    );

    for (const parsedSkill of skillsToSync) {
      try {
        const normalizedName = parsedSkill.name.toLowerCase().trim().replace(/\s+/g, '-');
        
        // Check if user already has this skill
        const existingUserSkill = existingSkillMap.get(normalizedName);

        if (existingUserSkill) {
          if (overwriteExisting) {
            // Update level based on confidence
            existingUserSkill.level = confidenceToLevel(parsedSkill.confidence);
            existingUserSkill.source = 'resume';
            await existingUserSkill.save();
            results.updated.push(parsedSkill.name);
          } else {
            results.skipped.push(parsedSkill.name);
          }
          continue;
        }

        // Find or create skill in master skills list
        let skill = await Skill.findOne({ normalizedName });
        
        if (!skill) {
          skill = await Skill.create({
            name: parsedSkill.name,
            domain: 'other',
          });
        }

        // Create user skill
        await UserSkill.create({
          userId: id,
          skillId: skill._id,
          level: confidenceToLevel(parsedSkill.confidence),
          source: 'resume',
        });

        results.added.push(parsedSkill.name);
      } catch (err) {
        results.failed.push({
          name: parsedSkill.name,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    // Update resume sync status
    resume.skillsSynced = true;
    resume.skillsSyncedAt = new Date();
    await resume.save();

    return success({
      summary: {
        added: results.added.length,
        updated: results.updated.length,
        skipped: results.skipped.length,
        failed: results.failed.length,
      },
      details: results,
    }, `Synced ${results.added.length + results.updated.length} skills from resume`);
  } catch (error) {
    return handleError(error);
  }
}
