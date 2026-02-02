/**
 * Users API Routes
 * 
 * GET /api/users - List users with pagination
 * POST /api/users - Create a new user
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';
import { successResponse, paginatedResponse, errors } from '@/lib/utils/api';
import { parsePaginationParams, createPagination } from '@/lib/utils/db';

/**
 * GET /api/users
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - role: Filter by role (user/mentor/admin)
 * - search: Search by name or email
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePaginationParams(searchParams);
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { isActive: true };
    
    if (role && ['user', 'mentor', 'admin'].includes(role)) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query with pagination
    const [users, totalItems] = await Promise.all([
      User.find(query)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    const pagination = createPagination(page, limit, totalItems);

    return paginatedResponse(users, pagination);
  } catch (error) {
    console.error('GET /api/users error:', error);
    return errors.serverError('Failed to fetch users');
  }
}

/**
 * POST /api/users
 * 
 * Create a new user (admin registration endpoint)
 * Regular user signup should use /api/auth/signup
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password, role = 'user', mobile } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return errors.validationError('Name, email, and password are required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errors.conflict('Email already registered');
    }

    // Create user (password will be hashed by pre-save middleware)
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role,
      mobile,
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toJSON();

    return successResponse(userResponse, 'User created successfully', 201);
  } catch (error) {
    console.error('POST /api/users error:', error);
    
    // Handle mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return errors.validationError(error.message);
    }
    
    return errors.serverError('Failed to create user');
  }
}
