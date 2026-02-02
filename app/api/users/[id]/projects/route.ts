/**
 * User Projects API Routes
 * 
 * GET /api/users/[id]/projects - Get user's project entries
 * POST /api/users/[id]/projects - Add project entry
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id]/projects
 * Get all project entries for a user
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
      return errors.forbidden('You can only access your own projects');
    }

    await connectDB();

    const user = await User.findById(id).select('profile.projects');

    if (!user) {
      return errors.notFound('User not found');
    }

    return success(user.profile?.projects || []);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/users/[id]/projects
 * Add a new project entry
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
      return errors.forbidden('You can only update your own projects');
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return errors.badRequest('Project name is required');
    }

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return errors.notFound('User not found');
    }

    // Add new project entry
    const newProject = {
      name: body.name,
      description: body.description,
      url: body.url,
      githubUrl: body.githubUrl,
      technologies: body.technologies || [],
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      isOngoing: body.isOngoing || false,
    };

    // Ensure profile and projects array exist
    if (!user.profile) {
      user.profile = { projects: [] };
    }
    if (!user.profile.projects) {
      user.profile.projects = [];
    }
    user.profile.projects.push(newProject);
    await user.save();

    // Return the newly added project (last item)
    const addedProject = user.profile.projects[user.profile.projects.length - 1];

    return success(addedProject, 'Project added successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}
