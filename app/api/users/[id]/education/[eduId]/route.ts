/**
 * Single Education Entry API Routes
 * 
 * PUT /api/users/[id]/education/[eduId] - Update education entry
 * DELETE /api/users/[id]/education/[eduId] - Delete education entry
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string; eduId: string }>;
}

/**
 * PUT /api/users/[id]/education/[eduId]
 * Update an education entry
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id, eduId } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only update your own education');
    }

    const body = await request.json();

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return errors.notFound('User not found');
    }

    // Find the education entry
    const educationArray = user.profile?.education || [];
    const educationIndex = educationArray.findIndex(
      (edu) => edu._id?.toString() === eduId
    );

    if (educationIndex === -1) {
      return errors.notFound('Education entry not found');
    }

    // Update the education entry
    const education = educationArray[educationIndex];
    if (body.institution !== undefined) education.institution = body.institution;
    if (body.degree !== undefined) education.degree = body.degree;
    if (body.fieldOfStudy !== undefined) education.fieldOfStudy = body.fieldOfStudy;
    if (body.startDate !== undefined) education.startDate = body.startDate ? new Date(body.startDate) : undefined;
    if (body.endDate !== undefined) education.endDate = body.endDate ? new Date(body.endDate) : undefined;
    if (body.grade !== undefined) education.grade = body.grade;
    if (body.description !== undefined) education.description = body.description;

    await user.save();

    return success(education, 'Education updated successfully');
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/users/[id]/education/[eduId]
 * Delete an education entry
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id, eduId } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only delete your own education');
    }

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return errors.notFound('User not found');
    }

    // Find and remove the education entry
    const educationArray = user.profile?.education || [];
    const educationIndex = educationArray.findIndex(
      (edu) => edu._id?.toString() === eduId
    );

    if (educationIndex === -1) {
      return errors.notFound('Education entry not found');
    }

    educationArray.splice(educationIndex, 1);
    if (user.profile) user.profile.education = educationArray;
    await user.save();

    return success(null, 'Education deleted successfully');
  } catch (error) {
    return handleError(error);
  }
}
