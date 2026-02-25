/**
 * User Profile API Routes
 * 
 * GET /api/users/[id]/profile - Get user profile with education, experience, projects
 * PUT /api/users/[id]/profile - Update user profile
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
 * GET /api/users/[id]/profile
 * Get user profile including education, experience, and projects
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Verify authentication
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    // Users can only access their own profile (unless admin)
    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only access your own profile');
    }

    await connectDB();

    const user = await User.findById(id).select('-password');

    if (!user) {
      return errors.notFound('User not found');
    }


    // Ensure profile object exists
    if (!user.profile) {
      user.profile = {};
    }

    // Ensure sub-arrays exist - initialize if undefined
    const profile = user.profile;
    if (profile) {
      if (!profile.achievements) profile.achievements = [];
      if (!profile.certificates) profile.certificates = [];
      if (!profile.education) profile.education = [];
      if (!profile.experience) profile.experience = [];
      if (!profile.projects) profile.projects = [];
    }

    return success({
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      image: user.image,
      profile: user.profile,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/users/[id]/profile
 * Update user profile
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Verify authentication
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    // Users can only update their own profile
    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only update your own profile');
    }

    const body = await request.json();

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return errors.notFound('User not found');
    }

    // Update basic fields
    if (body.name) user.name = body.name;
    if (body.mobile !== undefined) user.mobile = body.mobile;
    if (body.image !== undefined) user.image = body.image;

    // Update profile fields
    if (body.profile) {
      if (!user.profile) {
        user.profile = {};
      }

      const profile = user.profile;
      if (profile) {
        const { bio, headline, location, linkedinUrl, githubUrl } = body.profile;

        if (bio !== undefined) profile.bio = bio;
        if (headline !== undefined) profile.headline = headline;
        if (location !== undefined) profile.location = location;
        if (linkedinUrl !== undefined) profile.linkedinUrl = linkedinUrl;
        if (githubUrl !== undefined) profile.githubUrl = githubUrl;
      }
    }

    await user.save();

    return success({
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      image: user.image,
      profile: user.profile,
    }, 'Profile updated successfully');
  } catch (error) {
    return handleError(error);
  }
}
