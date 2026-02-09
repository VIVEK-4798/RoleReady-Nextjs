/**
 * User Experience API Routes
 * 
 * GET /api/users/[id]/experience - Get user's work experience entries
 * POST /api/users/[id]/experience - Add work experience entry
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
 * GET /api/users/[id]/experience
 * Get all experience entries for a user
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
      return errors.forbidden('You can only access your own experience');
    }

    await connectDB();

    const user = await User.findById(id).select('profile.experience');

    if (!user) {
      return errors.notFound('User not found');
    }

    return success(user.profile?.experience || []);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/users/[id]/experience
 * Add a new work experience entry
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
      return errors.forbidden('You can only update your own experience');
    }

    const body = await request.json();

    // Validate required fields
    if (!body.company || !body.title) {
      return errors.badRequest('Company and title are required');
    }

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return errors.notFound('User not found');
    }

    // Add new experience entry
    const newExperience = {
      company: body.company,
      title: body.title,
      location: body.location,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      isCurrent: body.isCurrent || false,
      description: body.description,
      skills: body.skills || [],
    };

    // Ensure profile and experience array exist
    if (!user.profile) {
      user.profile = { experience: [] };
    }
    if (!user.profile.experience) {
      user.profile.experience = [];
    }
    user.profile.experience.push(newExperience);
    await user.save();

    // Return the newly added experience (last item)
    const addedExperience = user.profile.experience[user.profile.experience.length - 1];

    return success(addedExperience, 'Experience added successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/users/[id]/experience
 * Update an existing experience entry
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
      return errors.forbidden('You can only update your own experience');
    }

    const body = await request.json();

    // Validate required fields
    if (!body._id) {
      return errors.badRequest('Experience ID is required for update');
    }
    if (!body.company || !body.title) {
      return errors.badRequest('Company and title are required');
    }

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return errors.notFound('User not found');
    }

    // Find the experience entry to update
    if (!user.profile?.experience) {
      return errors.notFound('No experience entries found');
    }

    const experienceIndex = user.profile.experience.findIndex(
      (exp: any) => exp._id.toString() === body._id.toString()
    );

    if (experienceIndex === -1) {
      return errors.notFound('Experience entry not found');
    }

    // Update the experience entry
    user.profile.experience[experienceIndex] = {
      ...user.profile.experience[experienceIndex],
      company: body.company,
      title: body.title,
      location: body.location,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      isCurrent: body.isCurrent || false,
      description: body.description,
      skills: body.skills || [],
    };

    await user.save();

    return success(user.profile.experience[experienceIndex], 'Experience updated successfully');
  } catch (error) {
    return handleError(error);
  }
}
