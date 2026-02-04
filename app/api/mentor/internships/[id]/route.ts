/**
 * Mentor Internship CRUD API
 * 
 * GET/PATCH/DELETE /api/mentor/internships/[id]
 * 
 * Mentors can only manage internships they created.
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Internship } from '@/lib/models';
import { requireMentorApi } from '@/lib/auth/utils';
import { Types } from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireMentorApi();
    if (error) return error;
    if (!user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const internship = await Internship.findById(id).populate('category', 'name colorClass');

    if (!internship) {
      return NextResponse.json({ success: false, error: 'Internship not found' }, { status: 404 });
    }

    // Check ownership for non-admins
    if (user.role !== 'admin' && internship.createdBy?.toString() !== user.id) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: internship });
  } catch (error) {
    console.error('Error fetching internship:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch internship' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireMentorApi();
    if (error) return error;
    if (!user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const internship = await Internship.findById(id);

    if (!internship) {
      return NextResponse.json({ success: false, error: 'Internship not found' }, { status: 404 });
    }

    // Check ownership for non-admins
    if (user.role !== 'admin' && internship.createdBy?.toString() !== user.id) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { title, company, category, city, stipend, duration, type, workDetail, isActive, isFeatured } = body;

    // Update fields
    if (title !== undefined) internship.title = title;
    if (company !== undefined) internship.company = company;
    if (category !== undefined) internship.category = category ? new Types.ObjectId(category) : undefined;
    if (city !== undefined) internship.city = city;
    if (stipend !== undefined) internship.stipend = stipend;
    if (duration !== undefined) internship.duration = duration;
    if (type !== undefined) internship.type = type;
    if (workDetail !== undefined) internship.workDetail = workDetail;
    if (isActive !== undefined) internship.isActive = isActive;
    if (isFeatured !== undefined) internship.isFeatured = isFeatured;

    await internship.save();

    return NextResponse.json({
      success: true,
      message: 'Internship updated successfully',
      data: internship,
    });
  } catch (error) {
    console.error('Error updating internship:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update internship' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireMentorApi();
    if (error) return error;
    if (!user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const internship = await Internship.findById(id);

    if (!internship) {
      return NextResponse.json({ success: false, error: 'Internship not found' }, { status: 404 });
    }

    // Check ownership for non-admins
    if (user.role !== 'admin' && internship.createdBy?.toString() !== user.id) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    await Internship.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Internship deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting internship:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete internship' },
      { status: 500 }
    );
  }
}
