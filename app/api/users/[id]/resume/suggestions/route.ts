/**
 * Resume Skill Suggestions API
 * 
 * GET /api/users/[id]/resume/suggestions - Get skill suggestions from parsed resume
 * POST /api/users/[id]/resume/suggestions - Confirm skill suggestions and add to user profile
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Resume, UserSkill, Skill } from '@/lib/models';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id]/resume/suggestions
 * Get skill suggestions from parsed resume (skills not yet in user profile)
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only access your own skill suggestions');
    }

    await connectDB();

    // Get user's active resume with extracted skills
    const resume = await Resume.findOne({ 
      userId: id, 
      isActive: true,
      status: 'completed' 
    }).sort({ createdAt: -1 });

    if (!resume || !resume.extractedData?.skills || resume.extractedData.skills.length === 0) {
      return success({
        suggestions: [],
        count: 0,
        message: 'No skill suggestions available. Please parse your resume first.',
      });
    }

    // Get user's existing skills
    const existingSkills = await UserSkill.find({ userId: id }).select('skillId');
    const existingSkillIds = new Set(existingSkills.map(s => s.skillId.toString()));

    // Get full skill details for extracted skills
    const extractedSkillNames = resume.extractedData.skills.map(s => s.name);
    const skills = await Skill.find({ name: { $in: extractedSkillNames } }).lean();

    // Filter out skills user already has
    const suggestions = skills
      .filter(skill => !existingSkillIds.has(skill._id.toString()))
      .map(skill => {
        const extracted = resume.extractedData!.skills.find(s => s.name === skill.name);
        return {
          skill_id: skill._id,
          skill_name: skill.name,
          domain: skill.domain,
          confidence: extracted?.confidence || 80,
          context: extracted?.context,
        };
      });

    return success({
      suggestions,
      count: suggestions.length,
      resume_id: resume._id,
      parsed_at: resume.parsedAt,
    });

  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/users/[id]/resume/suggestions
 * Confirm and add selected skill suggestions to user profile
 * 
 * Body:
 * - accepted_skill_ids: Array of skill IDs to add
 * - level: Skill level (beginner, intermediate, advanced, expert) - default: intermediate
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
      return errors.forbidden('You can only update your own skills');
    }

    const body = await request.json();
    const { accepted_skill_ids = [], level = 'intermediate' } = body;

    if (!Array.isArray(accepted_skill_ids) || accepted_skill_ids.length === 0) {
      return errors.badRequest('accepted_skill_ids must be a non-empty array');
    }

    // Validate level
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    if (!validLevels.includes(level)) {
      return errors.badRequest(`level must be one of: ${validLevels.join(', ')}`);
    }

    await connectDB();

    // Get user's active resume
    const resume = await Resume.findOne({ 
      userId: id, 
      isActive: true,
      status: 'completed' 
    });

    if (!resume) {
      return errors.notFound('No parsed resume found');
    }

    // Get skill details
    const skills = await Skill.find({ _id: { $in: accepted_skill_ids } });

    if (skills.length === 0) {
      return errors.badRequest('No valid skills found');
    }

    // Add skills to user profile with source = 'resume'
    const userSkills = skills.map(skill => ({
      userId: id,
      skillId: skill._id,
      level: level,
      source: 'resume',
      validationStatus: 'none',
    }));

    // Use insertMany with ordered: false to continue on duplicates
    let addedCount = 0;
    try {
      const result = await UserSkill.insertMany(userSkills, { ordered: false });
      addedCount = result.length;
    } catch (err: any) {
      // Handle duplicate key errors - some skills may already exist
      if (err.code === 11000) {
        // Count successful inserts
        addedCount = err.insertedDocs?.length || 0;
      } else {
        throw err;
      }
    }

    // Update resume sync status
    if (!resume.skillsSynced) {
      resume.skillsSynced = true;
      resume.skillsSyncedAt = new Date();
      await resume.save();
    }

    return success({
      message: `Added ${addedCount} skills from resume`,
      added_count: addedCount,
      skills_added: skills.map(s => ({
        skill_id: s._id,
        skill_name: s.name,
        level: level,
      })),
    });

  } catch (error) {
    return handleError(error);
  }
}
