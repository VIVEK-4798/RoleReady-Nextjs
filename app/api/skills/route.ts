/**
 * Skills API Routes
 * 
 * GET /api/skills - List skills with filtering
 * POST /api/skills - Create a new skill
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Skill } from '@/lib/models';
import { successResponse, paginatedResponse, errors } from '@/lib/utils/api';
import { parsePaginationParams, createPagination } from '@/lib/utils/db';

/**
 * GET /api/skills
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - domain: Filter by domain
 * - search: Search by name
 * - active: Filter by active status (default: true)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePaginationParams(searchParams);
    const domain = searchParams.get('domain');
    const search = searchParams.get('search');
    const active = searchParams.get('active') !== 'false';

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { isActive: active };
    
    if (domain) {
      query.domain = domain;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { normalizedName: { $regex: search.toLowerCase(), $options: 'i' } },
      ];
    }

    // Execute query with pagination
    const [skills, totalItems] = await Promise.all([
      Skill.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 }),
      Skill.countDocuments(query),
    ]);

    const pagination = createPagination(page, limit, totalItems);

    return paginatedResponse(skills, pagination);
  } catch (error) {
    console.error('GET /api/skills error:', error);
    return errors.serverError('Failed to fetch skills');
  }
}

/**
 * POST /api/skills
 * 
 * Create a new skill (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, domain = 'other', description } = body;

    // Validate required fields
    if (!name) {
      return errors.validationError('Skill name is required');
    }

    // Check for duplicate (normalized name)
    const normalizedName = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s\+\#\.\_\-]/g, '')
      .replace(/\s+/g, ' ');
    
    const existingSkill = await Skill.findOne({ normalizedName });
    if (existingSkill) {
      return errors.conflict('Skill already exists');
    }

    // Create skill
    const skill = new Skill({
      name: name.trim(),
      domain,
      description,
    });

    await skill.save();

    return successResponse(skill, 'Skill created successfully', 201);
  } catch (error) {
    console.error('POST /api/skills error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return errors.validationError(error.message);
    }
    
    return errors.serverError('Failed to create skill');
  }
}
