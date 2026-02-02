/**
 * Admin Single Skill API Routes
 * 
 * GET /api/admin/skills/[id] - Get skill by ID
 * PUT /api/admin/skills/[id] - Update skill
 * PATCH /api/admin/skills/[id] - Toggle active status
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Skill } from '@/lib/models';
import { successResponse, errors } from '@/lib/utils/api';
import { requireAdminApi } from '@/lib/auth/utils';
import { isValidObjectId } from '@/lib/utils/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/skills/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Require admin role
    const { error } = await requireAdminApi();
    if (error) return error;

    if (!isValidObjectId(id)) {
      return errors.badRequest('Invalid skill ID');
    }

    await connectDB();

    const skill = await Skill.findById(id);

    if (!skill) {
      return errors.notFound('Skill');
    }

    return successResponse(skill);
  } catch (error) {
    console.error('GET /api/admin/skills/[id] error:', error);
    return errors.serverError('Failed to fetch skill');
  }
}

/**
 * PUT /api/admin/skills/[id]
 * 
 * Update skill details
 * 
 * Body:
 * - name: Skill name (optional)
 * - domain: Skill domain (optional)
 * - description: Description (optional)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Require admin role
    const { error } = await requireAdminApi();
    if (error) return error;

    if (!isValidObjectId(id)) {
      return errors.badRequest('Invalid skill ID');
    }

    await connectDB();

    const body = await request.json();
    const { name, domain, description } = body;

    const skill = await Skill.findById(id);

    if (!skill) {
      return errors.notFound('Skill');
    }

    // Check for duplicate name if name is being changed
    if (name && name.trim() !== skill.name) {
      const normalizedName = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s\+\#\.\_\-]/g, '')
        .replace(/\s+/g, ' ');
      
      const existingSkill = await Skill.findOne({ 
        normalizedName, 
        _id: { $ne: skill._id } 
      });
      
      if (existingSkill) {
        return errors.conflict('A skill with this name already exists');
      }
      
      skill.name = name.trim();
    }

    if (domain !== undefined) {
      skill.domain = domain;
    }

    if (description !== undefined) {
      skill.description = description;
    }

    await skill.save();

    return successResponse(skill, 'Skill updated successfully');
  } catch (error) {
    console.error('PUT /api/admin/skills/[id] error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return errors.validationError(error.message);
    }
    
    return errors.serverError('Failed to update skill');
  }
}

/**
 * PATCH /api/admin/skills/[id]
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
    const { error } = await requireAdminApi();
    if (error) return error;

    if (!isValidObjectId(id)) {
      return errors.badRequest('Invalid skill ID');
    }

    await connectDB();

    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return errors.validationError('isActive must be a boolean');
    }

    const skill = await Skill.findById(id);

    if (!skill) {
      return errors.notFound('Skill');
    }

    skill.isActive = isActive;
    await skill.save();

    return successResponse(
      skill, 
      `Skill ${isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error) {
    console.error('PATCH /api/admin/skills/[id] error:', error);
    return errors.serverError('Failed to update skill status');
  }
}
