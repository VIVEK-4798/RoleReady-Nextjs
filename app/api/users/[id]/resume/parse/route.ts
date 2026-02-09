/**
 * Resume Parsing API
 * 
 * POST /api/users/[id]/resume/parse - Parse user's resume and extract skills
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Resume, Skill, UserSkill } from '@/lib/models';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';
import { parseResumeFile, SkillMatch } from '@/lib/services/resumeParser';
import path from 'path';
import fs from 'fs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/users/[id]/resume/parse
 * Parse user's active resume and extract skills
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
      return errors.forbidden('You can only parse your own resume');
    }

    await connectDB();

    // Get user's active resume
    const resume = await Resume.findOne({ userId: id, isActive: true }).sort({ createdAt: -1 });

    if (!resume) {
      return errors.notFound('No active resume found. Please upload a resume first.');
    }

    // Check if already parsed
    if (resume.status === 'completed' && resume.extractedData?.skills && resume.extractedData.skills.length > 0) {
      return success({
        message: 'Resume already parsed',
        resume_id: resume._id,
        extracted_skills: resume.extractedData?.skills?.length || 0,
        status: resume.status,
      });
    }

    // Update status to processing
    resume.status = 'processing';
    await resume.save();

    try {
      // Get file path - must match upload route UPLOAD_DIR
      const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
      const filePath = path.join(uploadsDir, resume.filename);

      console.log(`[resumeParser] Looking for file: ${filePath}`);
      console.log(`[resumeParser] File exists: ${fs.existsSync(filePath)}`);
      
      if (!fs.existsSync(filePath)) {
        // List files in directory for debugging
        if (fs.existsSync(uploadsDir)) {
          const files = fs.readdirSync(uploadsDir);
          console.log(`[resumeParser] Files in uploads dir:`, files);
        } else {
          console.log(`[resumeParser] Uploads directory doesn't exist: ${uploadsDir}`);
        }
        throw new Error(`Resume file not found on server: ${filePath}`);
      }

      // Get all skills from database
      const allSkills = await Skill.find({}).select('_id name normalizedName domain').lean();
      
      console.log(`[resumeParser] Found ${allSkills.length} skills in database`);
      
      if (allSkills.length === 0) {
        resume.status = 'failed';
        resume.parseError = 'No skills found in database. Please add skills first.';
        await resume.save();
        
        return errors.badRequest(
          'No skills in database. Run: npm run seed-skills to populate common skills, or add skills manually.'
        );
      }
      
      const skillsForMatching: SkillMatch[] = allSkills.map(skill => ({
        _id: skill._id.toString(),
        name: skill.name,
        normalizedName: skill.normalizedName,
        domain: skill.domain,
      }));

      // Parse resume
      console.log(`[resumeParser] Parsing resume: ${resume.originalName} (${resume.mimeType})`);
      const parseResult = await parseResumeFile(filePath, resume.mimeType, skillsForMatching);

      // Get user's existing skills to avoid duplicates
      const existingSkills = await UserSkill.find({ userId: id }).select('skillId');
      const existingSkillIds = new Set(existingSkills.map(s => s.skillId.toString()));

      // Filter out skills user already has
      const newSkills = parseResult.matchedSkills.filter(
        skill => !existingSkillIds.has(skill._id)
      );

      // Update resume with extracted data
      resume.status = 'completed';
      resume.parsedAt = new Date();
      resume.extractedData = {
        rawText: parseResult.rawText,
        skills: parseResult.matchedSkills.map(skill => ({
          name: skill.name,
          confidence: 80, // Default confidence for matched skills
          context: undefined,
        })),
      };
      await resume.save();

      console.log(`[resumeParser] Parse complete: ${parseResult.matchedSkills.length} skills found, ${newSkills.length} new suggestions`);

      return success({
        message: 'Resume parsed successfully',
        resume_id: resume._id,
        text_length: parseResult.textLength,
        total_skills_found: parseResult.matchedSkills.length,
        new_suggestions: newSkills.length,
        already_have: parseResult.matchedSkills.length - newSkills.length,
        suggestions: newSkills.map(s => ({
          skill_id: s._id,
          skill_name: s.name,
          domain: s.domain,
        })),
      });

    } catch (parseError: any) {
      console.error('[resumeParser] Parse error:', parseError);
      
      // Update resume status to failed
      resume.status = 'failed';
      resume.parseError = parseError.message || 'Failed to parse resume';
      await resume.save();

      return errors.serverError(`Failed to parse resume: ${parseError.message}`);
    }

  } catch (error) {
    return handleError(error);
  }
}
