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
import { promisify } from 'util';
import { UsageService } from '@/lib/services/usageService';
const unlinkAsync = promisify(fs.unlink);

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

    try {
      await UsageService.enforceAndIncrement(id, 'skillExtractions');
    } catch (planError: any) {
      return errors.forbidden(planError.message);
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

    let isTempFile = false;
    let targetPath = '';

    try {
      // Determine file path - handle local and remote files
      const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
      const localPathFromFilename = path.join(uploadsDir, resume.filename);

      if (resume.localPath && fs.existsSync(resume.localPath)) {
        targetPath = resume.localPath;
      } else if (fs.existsSync(localPathFromFilename)) {
        targetPath = localPathFromFilename;
      }
      // 2. If not local, check if it's a remote URL (e.g., Cloudinary)
      else if (resume.url && resume.url.startsWith('http')) {
        console.log(`[resumeParser] Downloading remote resume: ${resume.url}`);
        const response = await fetch(resume.url);

        if (!response.ok) {
          throw new Error(`Failed to download resume from URL: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Create a temp directory
        const tempDir = path.join(process.cwd(), 'tmp', 'resume-processing');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        // Save to temp file
        const tempFileName = `parse_${id}_${Date.now()}${path.extname(resume.originalName || '.pdf')}`;
        targetPath = path.join(tempDir, tempFileName);
        fs.writeFileSync(targetPath, buffer);
        isTempFile = true;

        console.log(`[resumeParser] Saved remote file to temp path: ${targetPath}`);
      } else {
        // Fallback or error if no way to get the file
        if (!fs.existsSync(uploadsDir)) {
          console.log(`[resumeParser] Uploads directory doesn't exist: ${uploadsDir}`);
        } else {
          const files = fs.readdirSync(uploadsDir);
          console.log(`[resumeParser] Files in uploads dir:`, files);
        }
        throw new Error(`Resume file not found on server or URL missing. Filename: ${resume.filename}`);
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
      console.log(`[resumeParser] Parsing resume: ${resume.originalName} (${resume.mimeType}) at ${targetPath}`);
      const parseResult = await parseResumeFile(targetPath, resume.mimeType, skillsForMatching);

      // Clean up temp file if created
      if (isTempFile && targetPath) {
        try {
          await unlinkAsync(targetPath);
          console.log(`[resumeParser] Cleaned up temp file: ${targetPath}`);
        } catch (cleanupError) {
          console.error('[resumeParser] Failed to cleanup temp file:', cleanupError);
        }
      }

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

      // Clean up temp file on error if created
      if (isTempFile && targetPath && fs.existsSync(targetPath)) {
        try {
          await unlinkAsync(targetPath);
        } catch (e) { }
      }

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
