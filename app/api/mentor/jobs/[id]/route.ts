/**
 * Mentor Job CRUD API
 * 
 * GET/PATCH/DELETE /api/mentor/jobs/[id]
 * 
 * Mentors can only manage jobs they created.
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Job } from '@/lib/models';
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

    const job = await Job.findById(id).populate('category', 'name colorClass');

    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    // Check ownership for non-admins
    if (user.role !== 'admin' && job.createdBy?.toString() !== user.id) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch job' },
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

    const job = await Job.findById(id);

    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    // Check ownership for non-admins
    if (user.role !== 'admin' && job.createdBy?.toString() !== user.id) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { title, company, category, city, salary, experience, type, workDetail, isActive, isFeatured } = body;

    // Update fields
    if (title !== undefined) job.title = title;
    if (company !== undefined) job.company = company;
    if (category !== undefined) job.category = category ? new Types.ObjectId(category) : undefined;
    if (city !== undefined) job.city = city;
    if (salary !== undefined) job.salary = salary;
    if (experience !== undefined) job.experience = experience;
    if (type !== undefined) job.type = type;
    if (workDetail !== undefined) job.workDetail = workDetail;
    if (isActive !== undefined) job.isActive = isActive;
    if (isFeatured !== undefined) job.isFeatured = isFeatured;

    await job.save();

    return NextResponse.json({
      success: true,
      message: 'Job updated successfully',
      data: job,
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update job' },
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

    const job = await Job.findById(id);

    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    // Check ownership for non-admins
    if (user.role !== 'admin' && job.createdBy?.toString() !== user.id) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    await Job.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}
