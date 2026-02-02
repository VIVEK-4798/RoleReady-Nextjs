/**
 * Admin Roles API Routes
 * 
 * GET /api/admin/roles - List all roles with filtering
 * POST /api/admin/roles - Create a new role
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Role } from '@/lib/models';
import { successResponse, paginatedResponse, errors } from '@/lib/utils/api';
import { requireAdminApi } from '@/lib/auth/utils';
import { parsePaginationParams, createPagination } from '@/lib/utils/db';

/**
 * GET /api/admin/roles
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - search: Search by name
 * - active: Filter by active status ('true', 'false', 'all')
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin role
    const { user, error } = await requireAdminApi();
    if (error) return error;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePaginationParams(searchParams, { page: 1, limit: 20 });
    const search = searchParams.get('search');
    const activeFilter = searchParams.get('active') || 'all';

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    
    // Active filter
    if (activeFilter === 'true') {
      query.isActive = true;
    } else if (activeFilter === 'false') {
      query.isActive = false;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query with pagination
    const [roles, totalItems] = await Promise.all([
      Role.find(query)
        .populate('benchmarks.skillId', 'name domain isActive')
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 }),
      Role.countDocuments(query),
    ]);

    const pagination = createPagination(page, limit, totalItems);

    // Transform to include computed fields
    const rolesData = roles.map((role) => ({
      _id: role._id,
      name: role.name,
      description: role.description,
      colorClass: role.colorClass,
      isActive: role.isActive,
      benchmarks: role.benchmarks,
      skillCount: role.benchmarks?.filter((b) => b.isActive).length || 0,
      requiredSkillCount: role.benchmarks?.filter((b) => b.isActive && b.importance === 'required').length || 0,
      updatedBy: role.updatedBy,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));

    return paginatedResponse(rolesData, pagination);
  } catch (error) {
    console.error('GET /api/admin/roles error:', error);
    return errors.serverError('Failed to fetch roles');
  }
}

/**
 * POST /api/admin/roles
 * 
 * Create a new role
 * 
 * Body:
 * - name: Role name (required)
 * - description: Description (optional)
 * - colorClass: Tailwind color class (optional)
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin role
    const { user, error } = await requireAdminApi();
    if (error) return error;

    await connectDB();

    const body = await request.json();
    const { name, description, colorClass = 'bg-blue-500' } = body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return errors.validationError('Role name is required');
    }

    // Check for duplicate name
    const existingRole = await Role.findOne({ 
      name: { $regex: `^${name.trim()}$`, $options: 'i' } 
    });
    
    if (existingRole) {
      return errors.conflict('A role with this name already exists');
    }

    // Create role
    const role = new Role({
      name: name.trim(),
      description,
      colorClass,
      updatedBy: user?.id,
      benchmarks: [],
    });

    await role.save();

    return successResponse(role, 'Role created successfully', 201);
  } catch (error) {
    console.error('POST /api/admin/roles error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return errors.validationError(error.message);
    }
    
    return errors.serverError('Failed to create role');
  }
}
