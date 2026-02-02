/**
 * Roles API Routes
 * 
 * GET /api/roles - List roles with skill counts
 * POST /api/roles - Create a new role
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Role } from '@/lib/models';
import { successResponse, paginatedResponse, errors } from '@/lib/utils/api';
import { parsePaginationParams, createPagination } from '@/lib/utils/db';

/**
 * GET /api/roles
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - search: Search by name
 * - active: Filter by active status (default: true)
 * - withBenchmarks: Include full benchmark details (default: false)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePaginationParams(searchParams);
    const search = searchParams.get('search');
    const active = searchParams.get('active') !== 'false';
    const withBenchmarks = searchParams.get('withBenchmarks') === 'true';

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { isActive: active };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Build projection
    const projection = withBenchmarks 
      ? {} 
      : { benchmarks: 0 }; // Exclude benchmarks by default for list view

    // Execute query with pagination
    let rolesQuery = Role.find(query, projection)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    // Populate skill details if benchmarks are included
    if (withBenchmarks) {
      rolesQuery = rolesQuery.populate('benchmarks.skillId', 'name domain');
    }

    const [roles, totalItems] = await Promise.all([
      rolesQuery,
      Role.countDocuments(query),
    ]);

    const pagination = createPagination(page, limit, totalItems);

    return paginatedResponse(roles, pagination);
  } catch (error) {
    console.error('GET /api/roles error:', error);
    return errors.serverError('Failed to fetch roles');
  }
}

/**
 * POST /api/roles
 * 
 * Create a new role (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, description, colorClass = 'bg-blue-500' } = body;

    // Validate required fields
    if (!name) {
      return errors.validationError('Role name is required');
    }

    // Check for duplicate
    const existingRole = await Role.findOne({ 
      name: { $regex: `^${name.trim()}$`, $options: 'i' } 
    });
    if (existingRole) {
      return errors.conflict('Role already exists');
    }

    // Create role
    const role = new Role({
      name: name.trim(),
      description,
      colorClass,
      benchmarks: [], // Start with no benchmarks
    });

    await role.save();

    return successResponse(role, 'Role created successfully', 201);
  } catch (error) {
    console.error('POST /api/roles error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return errors.validationError(error.message);
    }
    
    return errors.serverError('Failed to create role');
  }
}
