/**
 * Admin Internship Categories API
 * 
 * GET: List all internship categories with pagination
 * POST: Create new internship category
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import { Category } from '@/lib/models';

// GET /api/admin/categories/internships - List all internship categories
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
    const query: Record<string, unknown> = { type: 'internship' };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    // Get categories with pagination
    const [categories, total] = await Promise.all([
      Category.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Category.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        categories,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching internship categories:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories/internships - Create new internship category
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
    const { name, colorClass, description } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      type: 'internship',
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category already exists' },
        { status: 400 }
      );
    }

    // Create category
    const category = await Category.create({
      name,
      type: 'internship',
      colorClass: colorClass || '#3B82F6',
      description: description || '',
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      data: { category },
      message: 'Category created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating internship category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
