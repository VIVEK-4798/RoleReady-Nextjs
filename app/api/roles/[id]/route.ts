/**
 * Single Role API Routes
 * 
 * GET /api/roles/[id] - Get role by ID with benchmarks
 * PUT /api/roles/[id] - Update role
 * DELETE /api/roles/[id] - Delete role (soft delete)
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Role } from '@/lib/models';
import { successResponse, errors } from '@/lib/utils/api';
import { isValidObjectId } from '@/lib/utils/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/roles/[id]
 * 
 * Returns role with populated benchmark skill details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return errors.badRequest('Invalid role ID');
    }

    await connectDB();

    const role = await Role.findById(id)
      .populate('benchmarks.skillId', 'name domain description')
      .populate('updatedBy', 'name email');

    if (!role) {
      return errors.notFound('Role');
    }

    return successResponse(role);
  } catch (error) {
    console.error('GET /api/roles/[id] error:', error);
    return errors.serverError('Failed to fetch role');
  }
}

/**
 * PUT /api/roles/[id]
 * 
 * Update role metadata (not benchmarks - use /api/roles/[id]/benchmarks)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return errors.badRequest('Invalid role ID');
    }

    await connectDB();

    const body = await request.json();
    const { name, description, colorClass, isActive, updatedBy } = body;

    const role = await Role.findById(id);

    if (!role) {
      return errors.notFound('Role');
    }

    // Update allowed fields
    if (name) role.name = name.trim();
    if (description !== undefined) role.description = description;
    if (colorClass) role.colorClass = colorClass;
    if (isActive !== undefined) role.isActive = isActive;
    if (updatedBy) role.updatedBy = updatedBy;

    await role.save();

    return successResponse(role, 'Role updated successfully');
  } catch (error) {
    console.error('PUT /api/roles/[id] error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return errors.validationError(error.message);
    }
    
    return errors.serverError('Failed to update role');
  }
}

/**
 * DELETE /api/roles/[id]
 * 
 * Soft delete - sets isActive to false
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return errors.badRequest('Invalid role ID');
    }

    await connectDB();

    const role = await Role.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!role) {
      return errors.notFound('Role');
    }

    return successResponse(null, 'Role deleted successfully');
  } catch (error) {
    console.error('DELETE /api/roles/[id] error:', error);
    return errors.serverError('Failed to delete role');
  }
}
