/**
 * Mentor Internships API
 * 
 * GET /api/mentor/internships - List internships
 * POST /api/mentor/internships - Create internship
 * 
 * Mentors can manage internships they created.
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Internship, Category, ActivityLog } from '@/lib/models';
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

    // Build query - mentors see their own internships, admins see all
    const mentorQuery: Record<string, any> = {};
    if (user.role !== 'admin') {
      mentorQuery.createdBy = new Types.ObjectId(user.id);
    }

    // Filtered query for search/status
    const query: Record<string, any> = { ...mentorQuery };

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

    const [internships, total, activeCount, featuredCount] = await Promise.all([
      Internship.find(query)
        .populate('category', 'name colorClass')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Internship.countDocuments(query),
      Internship.countDocuments({ ...mentorQuery, isActive: true }),
      Internship.countDocuments({ ...mentorQuery, isFeatured: true }),
    ]);

    // Total for this mentor specifically (not filtered by search/status)
    const mentorTotal = await Internship.countDocuments(mentorQuery);

    return NextResponse.json({
      success: true,
      data: {
        internships,
        stats: {
          total: mentorTotal,
          active: activeCount,
          featured: featuredCount,
          applications: 0, // Applications count can be added when Application model is ready
        },
        pagination: {
          page,
          limit,
          total, // This is the filtered total
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching internships:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch internships' },
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
    const { title, company, category, city, stipend, duration, type, workDetail, isActive, isFeatured } = body;

    // Validate required fields
    if (!title || !company || !city) {
      return NextResponse.json(
        { success: false, error: 'Title, company, and city are required' },
        { status: 400 }
      );
    }

    // Create internship
    const internship = await Internship.create({
      title,
      company,
      category: category ? new Types.ObjectId(category) : undefined,
      city,
      stipend: stipend || 'Not specified',
      duration: duration || 'Not specified',
      type: type || 'Full-time',
      workDetail: workDetail || '',
      isActive: isActive !== false,
      isFeatured: isFeatured || false,
      createdBy: new Types.ObjectId(user.id),
    });

    // Log activity for mentor contribution graph
    await ActivityLog.logActivity(user.id, 'mentor', 'internship_added', {
      internshipId: internship._id.toString(),
      title,
      company,
    });

    return NextResponse.json({
      success: true,
      message: 'Internship created successfully',
      data: internship,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating internship:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create internship' },
      { status: 500 }
    );
  }
}
