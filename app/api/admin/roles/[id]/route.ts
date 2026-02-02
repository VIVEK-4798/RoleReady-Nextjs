/**
 * Admin Single Role API Routes
 * 
 * GET /api/admin/roles/[id] - Get role by ID with benchmarks
 * PUT /api/admin/roles/[id] - Update role details
 * PATCH /api/admin/roles/[id] - Toggle active status
 */

import { NextRequest } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/db/mongoose';
import { Role } from '@/lib/models';
import { successResponse, errors } from '@/lib/utils/api';
import { requireAdminApi } from '@/lib/auth/utils';
import { isValidObjectId } from '@/lib/utils/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/roles/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Require admin role
    const { error } = await requireAdminApi();
    if (error) return error;

    if (!isValidObjectId(id)) {
      return errors.badRequest('Invalid role ID');
    }

    await connectDB();

    const role = await Role.findById(id)
      .populate('benchmarks.skillId', 'name domain isActive');

    if (!role) {
      return errors.notFound('Role');
    }

    return successResponse({
      _id: role._id,
      name: role.name,
      description: role.description,
      colorClass: role.colorClass,
      isActive: role.isActive,
      benchmarks: role.benchmarks,
      skillCount: role.benchmarks?.filter((b) => b.isActive).length || 0,
      requiredSkillCount: role.benchmarks?.filter((b) => b.isActive && b.importance === 'required').length || 0,
      totalWeight: role.benchmarks?.filter((b) => b.isActive).reduce((sum, b) => sum + b.weight, 0) || 0,
      updatedBy: role.updatedBy,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    });
  } catch (error) {
    console.error('GET /api/admin/roles/[id] error:', error);
    return errors.serverError('Failed to fetch role');
  }
}

/**
 * PUT /api/admin/roles/[id]
 * 
 * Update role details (not benchmarks - use dedicated endpoint)
 * 
 * Body:
 * - name: Role name (optional)
 * - description: Description (optional)
 * - colorClass: Tailwind color class (optional)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Require admin role
    const { user, error } = await requireAdminApi();
    if (error) return error;

    if (!isValidObjectId(id)) {
      return errors.badRequest('Invalid role ID');
    }

    await connectDB();

    const body = await request.json();
    const { name, description, colorClass } = body;

    const role = await Role.findById(id);

    if (!role) {
      return errors.notFound('Role');
    }

    // Check for duplicate name if name is being changed
    if (name && name.trim() !== role.name) {
      const existingRole = await Role.findOne({ 
        name: { $regex: `^${name.trim()}$`, $options: 'i' },
        _id: { $ne: role._id }
      });
      
      if (existingRole) {
        return errors.conflict('A role with this name already exists');
      }
      
      role.name = name.trim();
    }

    if (description !== undefined) {
      role.description = description;
    }

    if (colorClass !== undefined) {
      role.colorClass = colorClass;
    }

    role.updatedBy = user?.id ? new Types.ObjectId(user.id) : undefined;
    await role.save();

    return successResponse(role, 'Role updated successfully');
  } catch (error) {
    console.error('PUT /api/admin/roles/[id] error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return errors.validationError(error.message);
    }
    
    return errors.serverError('Failed to update role');
  }
}

/**
 * PATCH /api/admin/roles/[id]
 * 
 * Toggle active status (activate/deactivate)
 * 
 * Body:
 * - isActive: boolean
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Require admin role
    const { user, error } = await requireAdminApi();
    if (error) return error;

    if (!isValidObjectId(id)) {
      return errors.badRequest('Invalid role ID');
    }

    await connectDB();

    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return errors.validationError('isActive must be a boolean');
    }

    const role = await Role.findById(id);

    if (!role) {
      return errors.notFound('Role');
    }

    role.isActive = isActive;
    role.updatedBy = user?.id ? new Types.ObjectId(user.id) : undefined;
    await role.save();

    return successResponse(
      role, 
      `Role ${isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error) {
    console.error('PATCH /api/admin/roles/[id] error:', error);
    return errors.serverError('Failed to update role status');
  }
}
