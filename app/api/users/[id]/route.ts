/**
 * Single User API Routes
 * 
 * GET /api/users/[id] - Get user by ID
 * PUT /api/users/[id] - Update user
 * DELETE /api/users/[id] - Delete user (soft delete)
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';
import { successResponse, errors } from '@/lib/utils/api';
import { isValidObjectId } from '@/lib/utils/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return errors.badRequest('Invalid user ID');
    }

    await connectDB();

    const user = await User.findById(id).select('-password');

    if (!user) {
      return errors.notFound('User');
    }

    return successResponse(user);
  } catch (error) {
    console.error('GET /api/users/[id] error:', error);
    return errors.serverError('Failed to fetch user');
  }
}

/**
 * PUT /api/users/[id]
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return errors.badRequest('Invalid user ID');
    }

    await connectDB();

    const body = await request.json();
    const { name, mobile, image, profile } = body;

    // Find and update user
    const user = await User.findById(id);

    if (!user) {
      return errors.notFound('User');
    }

    // Update allowed fields
    if (name) user.name = name;
    if (mobile !== undefined) user.mobile = mobile;
    if (image !== undefined) user.image = image;
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }

    await user.save();

    return successResponse(user.toJSON(), 'User updated successfully');
  } catch (error) {
    console.error('PUT /api/users/[id] error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return errors.validationError(error.message);
    }
    
    return errors.serverError('Failed to update user');
  }
}

/**
 * DELETE /api/users/[id]
 * 
 * Soft delete - sets isActive to false
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return errors.badRequest('Invalid user ID');
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return errors.notFound('User');
    }

    return successResponse(null, 'User deleted successfully');
  } catch (error) {
    console.error('DELETE /api/users/[id] error:', error);
    return errors.serverError('Failed to delete user');
  }
}
