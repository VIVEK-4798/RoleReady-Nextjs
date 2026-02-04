/**
 * Mentor Jobs API
 * 
 * GET /api/mentor/jobs - List jobs
 * POST /api/mentor/jobs - Create job
 * 
 * Mentors can manage jobs they created.
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Job, Category, ActivityLog } from '@/lib/models';
import { requireMentorApi } from '@/lib/auth/utils';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireMentorApi();
    if (error) return error;
    if (!user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    // Build query - mentors see their own jobs, admins see all
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (user.role !== 'admin') {
      query.createdBy = new Types.ObjectId(user.id);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('category', 'name colorClass')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireMentorApi();
    if (error) return error;
    if (!user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { title, company, category, city, salary, experience, type, workDetail, isActive, isFeatured } = body;

    // Validate required fields
    if (!title || !company || !city) {
      return NextResponse.json(
        { success: false, error: 'Title, company, and city are required' },
        { status: 400 }
      );
    }

    // Create job
    const job = await Job.create({
      title,
      company,
      category: category ? new Types.ObjectId(category) : undefined,
      city,
      salary: salary || 'Not specified',
      experience: experience || 'Not specified',
      type: type || 'Full-time',
      workDetail: workDetail || '',
      isActive: isActive !== false,
      isFeatured: isFeatured || false,
      createdBy: new Types.ObjectId(user.id),
    });

    // Log activity for mentor contribution graph
    await ActivityLog.logActivity(user.id, 'mentor', 'job_added', {
      jobId: job._id.toString(),
      title,
      company,
    });

    return NextResponse.json({
      success: true,
      message: 'Job created successfully',
      data: job,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create job' },
      { status: 500 }
    );
  }
}
