/**
 * Admin Internship Details API
 * 
 * PATCH: Update internship
 * DELETE: Delete internship
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import { Internship } from '@/lib/models';

// PATCH /api/admin/internships/[id] - Update internship
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;
    const body = await req.json();

    // Find internship
    const internship = await Internship.findById(id);

    if (!internship) {
      return NextResponse.json(
        { success: false, error: 'Internship not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    if (body.title !== undefined) internship.title = body.title;
    if (body.company !== undefined) internship.company = body.company;
    if (body.category !== undefined) internship.category = body.category;
    if (body.city !== undefined) internship.city = body.city;
    if (body.stipend !== undefined) internship.stipend = body.stipend;
    if (body.duration !== undefined) internship.duration = body.duration;
    if (body.type !== undefined) internship.type = body.type;
    if (body.workDetail !== undefined) internship.workDetail = body.workDetail;
    if (body.description !== undefined) internship.description = body.description;
    if (body.requirements !== undefined) internship.requirements = body.requirements;
    if (body.contactEmail !== undefined) internship.contactEmail = body.contactEmail;
    if (body.contactPhone !== undefined) internship.contactPhone = body.contactPhone;
    if (body.isActive !== undefined) internship.isActive = body.isActive;
    if (body.isFeatured !== undefined) internship.isFeatured = body.isFeatured;

    await internship.save();

    return NextResponse.json({
      success: true,
      data: { internship },
      message: 'Internship updated successfully',
    });
  } catch (error) {
    console.error('Error updating internship:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/internships/[id] - Delete internship
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;

    // Find and delete internship
    const internship = await Internship.findByIdAndDelete(id);

    if (!internship) {
      return NextResponse.json(
        { success: false, error: 'Internship not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Internship deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting internship:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
