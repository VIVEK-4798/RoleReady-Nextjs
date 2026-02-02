/**
 * Admin Single Benchmark API Routes
 * 
 * PUT /api/admin/roles/[id]/benchmarks/[benchmarkId] - Update a benchmark
 * DELETE /api/admin/roles/[id]/benchmarks/[benchmarkId] - Deactivate a benchmark
 */

import { NextRequest } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/db/mongoose';
import { Role } from '@/lib/models';
import { successResponse, errors } from '@/lib/utils/api';
import { requireAdminApi } from '@/lib/auth/utils';
import { isValidObjectId } from '@/lib/utils/db';

interface RouteParams {
  params: Promise<{ id: string; benchmarkId: string }>;
}

/**
 * PUT /api/admin/roles/[id]/benchmarks/[benchmarkId]
 * 
 * Update a single benchmark
 * 
 * Body:
 * - importance: 'required' | 'optional' (optional)
 * - weight: 1-10 (optional)
 * - requiredLevel: Skill level (optional)
 * - isActive: boolean (optional)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, benchmarkId } = await params;

    // Require admin role
    const { user, error } = await requireAdminApi();
    if (error) return error;

    if (!isValidObjectId(id)) {
      return errors.badRequest('Invalid role ID');
    }

    if (!isValidObjectId(benchmarkId)) {
      return errors.badRequest('Invalid benchmark ID');
    }

    await connectDB();

    const body = await request.json();
    const { importance, weight, requiredLevel, isActive } = body;

    // Find role
    const role = await Role.findById(id);
    if (!role) {
      return errors.notFound('Role');
    }

    // Find benchmark by _id
    const benchmarkIndex = role.benchmarks.findIndex(
      (b) => b._id?.toString() === benchmarkId
    );

    if (benchmarkIndex === -1) {
      return errors.notFound('Benchmark');
    }

    // Update fields
    if (importance !== undefined) {
      if (!['required', 'optional'].includes(importance)) {
        return errors.validationError('Importance must be "required" or "optional"');
      }
      role.benchmarks[benchmarkIndex].importance = importance;
    }

    if (weight !== undefined) {
      const boundedWeight = Math.min(10, Math.max(1, weight));
      role.benchmarks[benchmarkIndex].weight = boundedWeight;
    }

    if (requiredLevel !== undefined) {
      const validLevels = ['none', 'beginner', 'intermediate', 'advanced', 'expert'];
      if (!validLevels.includes(requiredLevel)) {
        return errors.validationError(`Required level must be one of: ${validLevels.join(', ')}`);
      }
      role.benchmarks[benchmarkIndex].requiredLevel = requiredLevel;
    }

    if (isActive !== undefined) {
      role.benchmarks[benchmarkIndex].isActive = isActive;
    }

    role.updatedBy = user?.id ? new Types.ObjectId(user.id) : undefined;
    await role.save();

    // Re-fetch with populated skill
    const updatedRole = await Role.findById(id)
      .populate('benchmarks.skillId', 'name domain isActive');

    const updatedBenchmark = updatedRole?.benchmarks.find(
      (b) => b._id?.toString() === benchmarkId
    );

    return successResponse(
      {
        benchmark: updatedBenchmark,
        roleId: updatedRole?._id,
      },
      'Benchmark updated successfully'
    );
  } catch (error) {
    console.error('PUT /api/admin/roles/[id]/benchmarks/[benchmarkId] error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return errors.validationError(error.message);
    }
    
    return errors.serverError('Failed to update benchmark');
  }
}

/**
 * DELETE /api/admin/roles/[id]/benchmarks/[benchmarkId]
 * 
 * Soft delete a benchmark (sets isActive to false)
 * Use query param ?hard=true for actual removal
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, benchmarkId } = await params;

    // Require admin role
    const { user, error } = await requireAdminApi();
    if (error) return error;

    if (!isValidObjectId(id)) {
      return errors.badRequest('Invalid role ID');
    }

    if (!isValidObjectId(benchmarkId)) {
      return errors.badRequest('Invalid benchmark ID');
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    // Find role
    const role = await Role.findById(id);
    if (!role) {
      return errors.notFound('Role');
    }

    // Find benchmark
    const benchmarkIndex = role.benchmarks.findIndex(
      (b) => b._id?.toString() === benchmarkId
    );

    if (benchmarkIndex === -1) {
      return errors.notFound('Benchmark');
    }

    if (hardDelete) {
      // Remove benchmark entirely
      role.benchmarks.splice(benchmarkIndex, 1);
    } else {
      // Soft delete - just deactivate
      role.benchmarks[benchmarkIndex].isActive = false;
    }

    role.updatedBy = user?.id ? new Types.ObjectId(user.id) : undefined;
    await role.save();

    return successResponse(
      { 
        removed: hardDelete,
        deactivated: !hardDelete,
        benchmarkId,
      },
      hardDelete 
        ? 'Benchmark removed from role' 
        : 'Benchmark deactivated'
    );
  } catch (error) {
    console.error('DELETE /api/admin/roles/[id]/benchmarks/[benchmarkId] error:', error);
    return errors.serverError('Failed to remove benchmark');
  }
}
