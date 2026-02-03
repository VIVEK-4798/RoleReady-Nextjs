/**
 * Admin Internship Category Details API
 * 
 * PATCH: Update internship category
 * DELETE: Delete internship category
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import { Category } from '@/lib/models';

// PATCH /api/admin/categories/internships/[id] - Update internship category
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

    // Find category
    const category = await Category.findOne({ _id: id, type: 'internship' });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    if (body.name !== undefined) category.name = body.name;
    if (body.colorClass !== undefined) category.colorClass = body.colorClass;
    if (body.description !== undefined) category.description = body.description;
    if (body.isActive !== undefined) category.isActive = body.isActive;

    await category.save();

    return NextResponse.json({
      success: true,
      data: { category },
      message: 'Category updated successfully',
    });
  } catch (error) {
    console.error('Error updating internship category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/internships/[id] - Delete internship category
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

    // Find and delete category
    const category = await Category.findOneAndDelete({
      _id: id,
      type: 'internship',
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting internship category:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
