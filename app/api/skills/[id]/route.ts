/**
 * Single Skill API Routes
 * 
 * GET /api/skills/[id] - Get skill by ID
 * PUT /api/skills/[id] - Update skill
 * DELETE /api/skills/[id] - Delete skill (soft delete)
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Skill } from '@/lib/models';
import { successResponse, errors } from '@/lib/utils/api';
import { isValidObjectId } from '@/lib/utils/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/skills/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

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
    console.error('GET /api/skills/[id] error:', error);
    return errors.serverError('Failed to fetch skill');
  }
}

/**
 * PUT /api/skills/[id]
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return errors.badRequest('Invalid skill ID');
    }

    await connectDB();

    const body = await request.json();
    const { name, domain, description, isActive } = body;

    const skill = await Skill.findById(id);

    if (!skill) {
      return errors.notFound('Skill');
    }

    // Update allowed fields
    if (name) skill.name = name.trim();
    if (domain) skill.domain = domain;
    if (description !== undefined) skill.description = description;
    if (isActive !== undefined) skill.isActive = isActive;

    await skill.save();

    return successResponse(skill, 'Skill updated successfully');
  } catch (error) {
    console.error('PUT /api/skills/[id] error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return errors.validationError(error.message);
    }
    
    return errors.serverError('Failed to update skill');
  }
}

/**
 * DELETE /api/skills/[id]
 * 
 * Soft delete - sets isActive to false
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isValidObjectId(id)) {
      return errors.badRequest('Invalid skill ID');
    }

    await connectDB();

    const skill = await Skill.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!skill) {
      return errors.notFound('Skill');
    }

    return successResponse(null, 'Skill deleted successfully');
  } catch (error) {
    console.error('DELETE /api/skills/[id] error:', error);
    return errors.serverError('Failed to delete skill');
  }
}
