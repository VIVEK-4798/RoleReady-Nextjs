/**
 * Admin Job Details API
 * 
 * PATCH: Update job
 * DELETE: Delete job
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import { Job } from '@/lib/models';

// PATCH /api/admin/jobs/[id] - Update job
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

    // Find job
    const job = await Job.findById(id);

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    if (body.title !== undefined) job.title = body.title;
    if (body.company !== undefined) job.company = body.company;
    if (body.category !== undefined) job.category = body.category;
    if (body.city !== undefined) job.city = body.city;
    if (body.salary !== undefined) job.salary = body.salary;
    if (body.experience !== undefined) job.experience = body.experience;
    if (body.type !== undefined) job.type = body.type;
    if (body.workDetail !== undefined) job.workDetail = body.workDetail;
    if (body.description !== undefined) job.description = body.description;
    if (body.requirements !== undefined) job.requirements = body.requirements;
    if (body.contactEmail !== undefined) job.contactEmail = body.contactEmail;
    if (body.contactPhone !== undefined) job.contactPhone = body.contactPhone;
    if (body.isActive !== undefined) job.isActive = body.isActive;
    if (body.isFeatured !== undefined) job.isFeatured = body.isFeatured;

    await job.save();

    return NextResponse.json({
      success: true,
      data: { job },
      message: 'Job updated successfully',
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/jobs/[id] - Delete job
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

    // Find and delete job
    const job = await Job.findByIdAndDelete(id);

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
