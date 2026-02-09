/**
 * User Education API Routes
 * 
 * GET /api/users/[id]/education - Get user's education entries
 * POST /api/users/[id]/education - Add education entry
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
 * GET /api/users/[id]/education
 * Get all education entries for a user
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
      return errors.forbidden('You can only access your own education');
    }

    await connectDB();

    const user = await User.findById(id).select('profile.education');

    if (!user) {
      return errors.notFound('User not found');
    }

    return success(user.profile?.education || []);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/users/[id]/education
 * Add a new education entry
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
      return errors.forbidden('You can only update your own education');
    }

    const body = await request.json();

    // Validate required fields
    if (!body.institution || !body.degree) {
      return errors.badRequest('Institution and degree are required');
    }

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return errors.notFound('User not found');
    }

    // Add new education entry
    const newEducation = {
      institution: body.institution,
      degree: body.degree,
      fieldOfStudy: body.fieldOfStudy,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      grade: body.grade,
      description: body.description,
    };

    // Ensure profile and education array exist
    if (!user.profile) {
      user.profile = { education: [] };
    }
    if (!user.profile.education) {
      user.profile.education = [];
    }
    user.profile.education.push(newEducation);
    await user.save();

    // Return the newly added education (last item)
    const addedEducation = user.profile.education[user.profile.education.length - 1];

    return success(addedEducation, 'Education added successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/users/[id]/education
 * Update an existing education entry
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only update your own education');
    }

    const body = await request.json();

    // Validate required fields
    if (!body._id) {
      return errors.badRequest('Education ID is required for update');
    }
    if (!body.institution || !body.degree) {
      return errors.badRequest('Institution and degree are required');
    }

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return errors.notFound('User not found');
    }

    // Find the education entry to update
    if (!user.profile?.education) {
      return errors.notFound('No education entries found');
    }

    const educationIndex = user.profile.education.findIndex(
      (edu: any) => edu._id.toString() === body._id.toString()
    );

    if (educationIndex === -1) {
      return errors.notFound('Education entry not found');
    }

    // Update the education entry
    user.profile.education[educationIndex] = {
      ...user.profile.education[educationIndex],
      institution: body.institution,
      degree: body.degree,
      fieldOfStudy: body.fieldOfStudy,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      grade: body.grade,
      description: body.description,
    };

    await user.save();

    return success(user.profile.education[educationIndex], 'Education updated successfully');
  } catch (error) {
    return handleError(error);
  }
}
