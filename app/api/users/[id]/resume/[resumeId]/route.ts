/**
 * Single Resume API Routes
 * 
 * GET /api/users/[id]/resume/[resumeId] - Get single resume details
 * DELETE /api/users/[id]/resume/[resumeId] - Delete a resume
 * PATCH /api/users/[id]/resume/[resumeId] - Set resume as active
 */

import { NextRequest } from 'next/server';
import { unlink } from 'fs/promises';
import connectDB from '@/lib/db/mongoose';
import { Resume } from '@/lib/models';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string; resumeId: string }>;
}

/**
 * GET /api/users/[id]/resume/[resumeId]
 * Get a single resume with details
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id, resumeId } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only access your own resumes');
    }

    await connectDB();

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: id,
    }).select('-localPath');

    if (!resume) {
      return errors.notFound('Resume not found');
    }

    return success(resume);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/users/[id]/resume/[resumeId]
 * Set a resume as active or trigger actions
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id, resumeId } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only update your own resumes');
    }

    const body = await request.json();

    await connectDB();

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: id,
    });

    if (!resume) {
      return errors.notFound('Resume not found');
    }

    // Set as active (deactivates others)
    if (body.isActive === true) {
      await Resume.updateMany(
        { userId: id, _id: { $ne: resumeId } },
        { isActive: false }
      );
      resume.isActive = true;
    }

    // Trigger skill sync
    if (body.syncSkills === true && resume.status === 'completed') {
      // TODO: Implement skill sync from parsed resume data
      resume.skillsSynced = true;
      resume.skillsSyncedAt = new Date();
    }

    await resume.save();

    return success({
      id: resume._id,
      isActive: resume.isActive,
      skillsSynced: resume.skillsSynced,
    }, 'Resume updated');
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/users/[id]/resume/[resumeId]
 * Delete a resume
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id, resumeId } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only delete your own resumes');
    }

    await connectDB();

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: id,
    });

    if (!resume) {
      return errors.notFound('Resume not found');
    }

    // Delete file from disk
    if (resume.localPath) {
      try {
        await unlink(resume.localPath);
      } catch (err) {
        console.error('Failed to delete resume file:', err);
        // Continue with DB deletion even if file delete fails
      }
    }

    // Delete from database
    await Resume.deleteOne({ _id: resumeId });

    // If this was the active resume, set the latest one as active
    if (resume.isActive) {
      const latestResume = await Resume.findOne({ userId: id })
        .sort({ version: -1 });
      if (latestResume) {
        latestResume.isActive = true;
        await latestResume.save();
      }
    }

    return success(null, 'Resume deleted successfully');
  } catch (error) {
    return handleError(error);
  }
}
