/**
 * Role Benchmarks API Routes
 * 
 * Manage skill benchmarks for a role.
 * 
 * GET /api/roles/[id]/benchmarks - Get all benchmarks for a role
 * POST /api/roles/[id]/benchmarks - Add a benchmark
 * DELETE /api/roles/[id]/benchmarks - Remove a benchmark
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Role, Skill } from '@/lib/models';
import { successResponse, errors } from '@/lib/utils/api';
import { isValidObjectId, toObjectId } from '@/lib/utils/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/roles/[id]/benchmarks
 * 
 * Get all benchmarks for a role with skill details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return errors.badRequest('Invalid role ID');
    }

    await connectDB();

    const role = await Role.findById(id)
      .select('name benchmarks')
      .populate('benchmarks.skillId', 'name domain description');

    if (!role) {
      return errors.notFound('Role');
    }

    // Filter to active benchmarks only
    const activeBenchmarks = role.benchmarks?.filter(b => b.isActive) || [];

    return successResponse({
      roleId: role._id,
      roleName: role.name,
      benchmarks: activeBenchmarks,
      totalCount: activeBenchmarks.length,
      requiredCount: activeBenchmarks.filter(b => b.importance === 'required').length,
      optionalCount: activeBenchmarks.filter(b => b.importance === 'optional').length,
    });
  } catch (error) {
    console.error('GET /api/roles/[id]/benchmarks error:', error);
    return errors.serverError('Failed to fetch benchmarks');
  }
}

/**
 * POST /api/roles/[id]/benchmarks
 * 
 * Add or update a benchmark for a role
 * 
 * Body:
 * - skillId: Skill ObjectId (required)
 * - importance: 'required' | 'optional' (default: 'optional')
 * - weight: 1-10 (default: 1)
 * - requiredLevel: skill level (default: 'beginner')
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

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
      return errors.validationError('Valid skillId is required');
    }

    // Check skill exists
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return errors.notFound('Skill');
    }

    // Check role exists
    const role = await Role.findById(id);
    if (!role) {
      return errors.notFound('Role');
    }

    // Add or update benchmark
    const skillObjectId = toObjectId(skillId);
    if (!skillObjectId) {
      return errors.badRequest('Invalid skill ID format');
    }

    await role.addBenchmark({
      skillId: skillObjectId,
      importance,
      weight: Math.min(10, Math.max(1, weight)),
      requiredLevel,
      isActive: true,
    });

    // Reload with populated data
    await role.populate('benchmarks.skillId', 'name domain');

    return successResponse(role, 'Benchmark added successfully', 201);
  } catch (error) {
    console.error('POST /api/roles/[id]/benchmarks error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return errors.validationError(error.message);
    }
    
    return errors.serverError('Failed to add benchmark');
  }
}

/**
 * DELETE /api/roles/[id]/benchmarks
 * 
 * Remove a benchmark from a role
 * 
 * Body:
 * - skillId: Skill ObjectId to remove
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return errors.badRequest('Invalid role ID');
    }

    await connectDB();

    const body = await request.json();
    const { skillId } = body;

    if (!skillId || !isValidObjectId(skillId)) {
      return errors.validationError('Valid skillId is required');
    }

    const role = await Role.findById(id);
    if (!role) {
      return errors.notFound('Role');
    }

    const skillObjectId = toObjectId(skillId);
    if (!skillObjectId) {
      return errors.badRequest('Invalid skill ID format');
    }

    await role.removeBenchmark(skillObjectId);

    return successResponse(null, 'Benchmark removed successfully');
  } catch (error) {
    console.error('DELETE /api/roles/[id]/benchmarks error:', error);
    return errors.serverError('Failed to remove benchmark');
  }
}
