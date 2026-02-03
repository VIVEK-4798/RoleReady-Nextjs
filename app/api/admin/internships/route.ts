/**
 * Admin Internships API
 * 
 * GET: List all internships with pagination
 * POST: Create new internship
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import { Internship } from '@/lib/models';

// GET /api/admin/internships - List all internships
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

    // Get internships with pagination
    const [internships, total] = await Promise.all([
      Internship.find(query)
        .populate('category', 'name colorClass')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Internship.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        internships,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching internships:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/internships - Create new internship
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
      city,
      stipend,
      duration,
      type,
      workDetail,
      description,
      requirements,
      contactEmail,
      contactPhone,
    } = body;

    // Validate required fields
    if (!title || !company || !city || !stipend || !duration || !type || !workDetail) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Create internship
    const internship = await Internship.create({
      title,
      company,
      category: category || undefined,
      city,
      stipend,
      duration,
      type,
      workDetail,
      description: description || '',
      requirements: requirements || '',
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      isActive: true,
      isFeatured: false,
      createdBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      data: { internship },
      message: 'Internship created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating internship:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
