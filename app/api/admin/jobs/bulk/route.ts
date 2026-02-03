/**
 * Admin Jobs Bulk Actions API
 * 
 * POST: Perform bulk actions on jobs (delete, activate/deactivate, feature/unfeature)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import { Job } from '@/lib/models';

// POST /api/admin/jobs/bulk - Bulk actions
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
    const { action, ids } = body;

    // Validate required fields
    if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'delete':
        result = await Job.deleteMany({ _id: { $in: ids } });
        break;
      
      case 'activate':
        result = await Job.updateMany(
          { _id: { $in: ids } },
          { $set: { isActive: true } }
        );
        break;
      
      case 'deactivate':
        result = await Job.updateMany(
          { _id: { $in: ids } },
          { $set: { isActive: false } }
        );
        break;
      
      case 'feature':
        result = await Job.updateMany(
          { _id: { $in: ids } },
          { $set: { isFeatured: true } }
        );
        break;
      
      case 'unfeature':
        result = await Job.updateMany(
          { _id: { $in: ids } },
          { $set: { isFeatured: false } }
        );
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      data: { count: 'modifiedCount' in result ? result.modifiedCount : result.deletedCount },
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
