/**
 * Admin Jobs API
 * 
 * GET: List all jobs with pagination
 * POST: Create new job
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import { Job } from '@/lib/models';
import { notifyUsersForJob } from '@/services/notifications/jobNotificationService';

// GET /api/admin/jobs - List all jobs
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    // Get jobs with pagination
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
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/jobs - Create new job
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();
    const {
      title,
      company,
      category,
      roleId,
      city,
      salary,
      experience,
      type,
      workDetail,
      description,
      requirements,
      contactEmail,
      contactPhone,
    } = body;

    // Validate required fields
    if (!title || !company || !city || !salary || !experience || !type || !workDetail) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Create job
    const job = await Job.create({
      title,
      company,
      category: category || undefined,
      roleId: roleId || category || undefined, // Fallback to category if roleId not explicit
      city,
      salary,
      experience,
      type,
      workDetail,
      description: description || '',
      requirements: requirements || '',
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      isActive: true,
      isFeatured: false,
      source: 'internal',
      postedByRole: 'admin',
      priority: 100,
      createdBy: session.user.id,
    });

    // Trigger role-matched notifications (Background/Non-blocking)
    // We don't await this to keep the API response snappy
    notifyUsersForJob(job).catch(err => console.error('Notification trigger error:', err));

    return NextResponse.json({
      success: true,
      data: { job },
      message: 'Job created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
