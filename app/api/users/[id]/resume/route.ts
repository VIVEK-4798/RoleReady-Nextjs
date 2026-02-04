/**
 * User Resume API Routes
 * 
 * GET /api/users/[id]/resume - Get user's resumes
 * POST /api/users/[id]/resume - Upload new resume
 */

import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/db/mongoose';
import { Resume, ActivityLog } from '@/lib/models';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'resumes');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * GET /api/users/[id]/resume
 * Get all resumes for a user
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
      return errors.forbidden('You can only access your own resumes');
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    await connectDB();

    const query: Record<string, unknown> = { userId: id };
    if (activeOnly) {
      query.isActive = true;
    }

    const resumes = await Resume.find(query)
      .sort({ version: -1 })
      .select('-extractedData.rawText -localPath');

    return success(resumes);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/users/[id]/resume
 * Upload a new resume
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
      return errors.forbidden('You can only upload to your own profile');
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return errors.badRequest('No file provided');
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return errors.badRequest('Invalid file type. Only PDF and Word documents are allowed.');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return errors.badRequest('File too large. Maximum size is 5MB.');
    }

    await connectDB();

    // Get next version number
    const lastResume = await Resume.findOne({ userId: id })
      .sort({ version: -1 })
      .select('version');
    const nextVersion = (lastResume?.version || 0) + 1;

    // Generate unique filename
    const ext = path.extname(file.name);
    const filename = `${id}_v${nextVersion}_${uuidv4()}${ext}`;

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Save file
    const filePath = path.join(UPLOAD_DIR, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create resume record
    const resume = await Resume.create({
      userId: id,
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      localPath: filePath,
      status: 'pending',
      isActive: true,
      version: nextVersion,
    });

    // Log activity for contribution graph
    await ActivityLog.logActivity(id, 'user', 'resume_uploaded', {
      resumeId: resume._id.toString(),
      version: nextVersion,
    });

    // TODO: Queue resume parsing job here
    // For now, we'll leave status as 'pending'

    return success({
      id: resume._id,
      filename: resume.originalName,
      version: resume.version,
      status: resume.status,
      size: resume.size,
      createdAt: resume.createdAt,
    }, 'Resume uploaded successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}
