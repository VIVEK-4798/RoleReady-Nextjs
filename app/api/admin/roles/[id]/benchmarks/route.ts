/**
 * Admin Role Benchmarks API Routes
 * 
 * GET /api/admin/roles/[id]/benchmarks - Get all benchmarks for a role
 * POST /api/admin/roles/[id]/benchmarks - Add a benchmark to a role
 * PUT /api/admin/roles/[id]/benchmarks - Bulk update benchmarks
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Role, Skill } from '@/lib/models';
import { successResponse, errors } from '@/lib/utils/api';
import { requireAdminApi } from '@/lib/auth/utils';
import { isValidObjectId } from '@/lib/utils/db';
import { Types } from 'mongoose';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/roles/[id]/benchmarks
 * 
 * Get all benchmarks for a role with skill details
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
      roleId: role._id,
      roleName: role.name,
      benchmarks: role.benchmarks,
      stats: {
        total: role.benchmarks.length,
        active: role.benchmarks.filter((b) => b.isActive).length,
        required: role.benchmarks.filter((b) => b.isActive && b.importance === 'required').length,
        optional: role.benchmarks.filter((b) => b.isActive && b.importance === 'optional').length,
        totalWeight: role.benchmarks.filter((b) => b.isActive).reduce((sum, b) => sum + b.weight, 0),
      },
    });
  } catch (error) {
    console.error('GET /api/admin/roles/[id]/benchmarks error:', error);
    return errors.serverError('Failed to fetch benchmarks');
  }
}

/**
 * POST /api/admin/roles/[id]/benchmarks
 * 
 * Add a new benchmark to a role
 * 
 * Body:
 * - skillId: Skill ObjectId (required)
 * - importance: 'required' | 'optional' (default: 'optional')
 * - weight: 1-10 (default: 1)
 * - requiredLevel: Skill level (default: 'beginner')
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const { 
      skillId, 
      importance = 'optional', 
      weight = 1, 
      requiredLevel = 'beginner' 
    } = body;

    // Validate skillId
    if (!skillId || !isValidObjectId(skillId)) {
      return errors.validationError('Valid skill ID is required');
    }

    // Verify skill exists
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return errors.notFound('Skill');
    }

    // Find role
    const role = await Role.findById(id);
    if (!role) {
      return errors.notFound('Role');
    }

    // Check if benchmark already exists
    const existingBenchmark = role.benchmarks.find(
      (b) => b.skillId.toString() === skillId
    );
    
    if (existingBenchmark) {
      return errors.conflict('This skill is already added to the role');
    }

    // Validate weight bounds
    const boundedWeight = Math.min(10, Math.max(1, weight));

    // Validate importance
    if (!['required', 'optional'].includes(importance)) {
      return errors.validationError('Importance must be "required" or "optional"');
    }

    // Validate requiredLevel
    const validLevels = ['none', 'beginner', 'intermediate', 'advanced', 'expert'];
    if (!validLevels.includes(requiredLevel)) {
      return errors.validationError(`Required level must be one of: ${validLevels.join(', ')}`);
    }

    // Add benchmark
    role.benchmarks.push({
      skillId: new Types.ObjectId(skillId),
      importance,
      weight: boundedWeight,
      requiredLevel,
      isActive: true,
    });

    role.updatedBy = user?.id ? new Types.ObjectId(user.id) : undefined;
    await role.save();

    // Re-fetch with populated skill
    const updatedRole = await Role.findById(id)
      .populate('benchmarks.skillId', 'name domain isActive');

    return successResponse(
      {
        roleId: updatedRole?._id,
        benchmarks: updatedRole?.benchmarks,
      },
      'Benchmark added successfully',
      201
    );
  } catch (error) {
    console.error('POST /api/admin/roles/[id]/benchmarks error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return errors.validationError(error.message);
    }
    
    return errors.serverError('Failed to add benchmark');
  }
}

/**
 * PUT /api/admin/roles/[id]/benchmarks
 * 
 * Bulk update all benchmarks for a role
 * Replaces existing benchmarks with new ones
 * 
 * Body:
 * - benchmarks: Array of benchmark objects
 *   - skillId: Skill ObjectId
 *   - importance: 'required' | 'optional'
 *   - weight: 1-10
 *   - requiredLevel: Skill level
 *   - isActive: boolean
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
    const { benchmarks } = body;

    if (!Array.isArray(benchmarks)) {
      return errors.validationError('Benchmarks must be an array');
    }

    // Find role
    const role = await Role.findById(id);
    if (!role) {
      return errors.notFound('Role');
    }

    // Validate and transform benchmarks
    const validLevels = ['none', 'beginner', 'intermediate', 'advanced', 'expert'];
    const processedBenchmarks = [];

    for (const benchmark of benchmarks) {
      if (!benchmark.skillId || !isValidObjectId(benchmark.skillId)) {
        return errors.validationError('Each benchmark must have a valid skillId');
      }

      // Verify skill exists
      const skill = await Skill.findById(benchmark.skillId);
      if (!skill) {
        return errors.validationError(`Skill not found: ${benchmark.skillId}`);
      }

      processedBenchmarks.push({
        skillId: new Types.ObjectId(benchmark.skillId),
        importance: ['required', 'optional'].includes(benchmark.importance) 
          ? benchmark.importance 
          : 'optional',
        weight: Math.min(10, Math.max(1, benchmark.weight || 1)),
        requiredLevel: validLevels.includes(benchmark.requiredLevel) 
          ? benchmark.requiredLevel 
          : 'beginner',
        isActive: benchmark.isActive !== false,
      });
    }

    // Replace benchmarks
    role.benchmarks = processedBenchmarks;
    role.updatedBy = user?.id ? new Types.ObjectId(user.id) : undefined;
    await role.save();

    // Re-fetch with populated skills
    const updatedRole = await Role.findById(id)
      .populate('benchmarks.skillId', 'name domain isActive');

    return successResponse(
      {
        roleId: updatedRole?._id,
        benchmarks: updatedRole?.benchmarks,
        stats: {
          total: updatedRole?.benchmarks.length || 0,
          active: updatedRole?.benchmarks.filter((b) => b.isActive).length || 0,
          required: updatedRole?.benchmarks.filter((b) => b.isActive && b.importance === 'required').length || 0,
        },
      },
      'Benchmarks updated successfully'
    );
  } catch (error) {
    console.error('PUT /api/admin/roles/[id]/benchmarks error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return errors.validationError(error.message);
    }
    
    return errors.serverError('Failed to update benchmarks');
  }
}
