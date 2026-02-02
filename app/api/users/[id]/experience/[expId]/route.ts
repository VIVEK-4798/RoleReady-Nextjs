/**
 * Single Experience Entry API Routes
 * 
 * PUT /api/users/[id]/experience/[expId] - Update experience entry
 * DELETE /api/users/[id]/experience/[expId] - Delete experience entry
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string; expId: string }>;
}

/**
 * PUT /api/users/[id]/experience/[expId]
 * Update a work experience entry
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id, expId } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only update your own experience');
    }

    const body = await request.json();

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return errors.notFound('User not found');
    }

    // Find the experience entry
    const experienceArray = user.profile?.experience || [];
    const experienceIndex = experienceArray.findIndex(
      (exp) => exp._id?.toString() === expId
    );

    if (experienceIndex === -1) {
      return errors.notFound('Experience entry not found');
    }

    // Update the experience entry
    const experience = experienceArray[experienceIndex];
    if (body.company !== undefined) experience.company = body.company;
    if (body.title !== undefined) experience.title = body.title;
    if (body.location !== undefined) experience.location = body.location;
    if (body.startDate !== undefined) experience.startDate = body.startDate ? new Date(body.startDate) : undefined;
    if (body.endDate !== undefined) experience.endDate = body.endDate ? new Date(body.endDate) : undefined;
    if (body.isCurrent !== undefined) experience.isCurrent = body.isCurrent;
    if (body.description !== undefined) experience.description = body.description;
    if (body.skills !== undefined) experience.skills = body.skills;

    await user.save();

    return success(experience, 'Experience updated successfully');
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/users/[id]/experience/[expId]
 * Delete a work experience entry
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id, expId } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only delete your own experience');
    }

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return errors.notFound('User not found');
    }

    // Find and remove the experience entry
    const experienceArray = user.profile?.experience || [];
    const experienceIndex = experienceArray.findIndex(
      (exp) => exp._id?.toString() === expId
    );

    if (experienceIndex === -1) {
      return errors.notFound('Experience entry not found');
    }

    experienceArray.splice(experienceIndex, 1);
    if (user.profile) user.profile.experience = experienceArray;
    await user.save();

    return success(null, 'Experience deleted successfully');
  } catch (error) {
    return handleError(error);
  }
}
