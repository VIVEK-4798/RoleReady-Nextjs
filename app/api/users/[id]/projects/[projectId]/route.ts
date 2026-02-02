/**
 * Single Project Entry API Routes
 * 
 * PUT /api/users/[id]/projects/[projectId] - Update project entry
 * DELETE /api/users/[id]/projects/[projectId] - Delete project entry
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string; projectId: string }>;
}

/**
 * PUT /api/users/[id]/projects/[projectId]
 * Update a project entry
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id, projectId } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only update your own projects');
    }

    const body = await request.json();

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return errors.notFound('User not found');
    }

    // Find the project entry
    const projectsArray = user.profile?.projects || [];
    const projectIndex = projectsArray.findIndex(
      (proj) => proj._id?.toString() === projectId
    );

    if (projectIndex === -1) {
      return errors.notFound('Project entry not found');
    }

    // Update the project entry
    const project = projectsArray[projectIndex];
    if (body.name !== undefined) project.name = body.name;
    if (body.description !== undefined) project.description = body.description;
    if (body.url !== undefined) project.url = body.url;
    if (body.githubUrl !== undefined) project.githubUrl = body.githubUrl;
    if (body.technologies !== undefined) project.technologies = body.technologies;
    if (body.startDate !== undefined) project.startDate = body.startDate ? new Date(body.startDate) : undefined;
    if (body.endDate !== undefined) project.endDate = body.endDate ? new Date(body.endDate) : undefined;
    if (body.isOngoing !== undefined) project.isOngoing = body.isOngoing;

    await user.save();

    return success(project, 'Project updated successfully');
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/users/[id]/projects/[projectId]
 * Delete a project entry
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id, projectId } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only delete your own projects');
    }

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return errors.notFound('User not found');
    }

    // Find and remove the project entry
    const projectsArray = user.profile?.projects || [];
    const projectIndex = projectsArray.findIndex(
      (proj) => proj._id?.toString() === projectId
    );

    if (projectIndex === -1) {
      return errors.notFound('Project entry not found');
    }

    projectsArray.splice(projectIndex, 1);
    if (user.profile) user.profile.projects = projectsArray;
    await user.save();

    return success(null, 'Project deleted successfully');
  } catch (error) {
    return handleError(error);
  }
}
