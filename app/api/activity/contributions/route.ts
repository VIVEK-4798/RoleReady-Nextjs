/**
 * Contributions API
 * 
 * GET /api/activity/contributions
 * 
 * Returns activity contributions for the past 365 days.
 * Used by the contribution graph component.
 * 
 * Response format:
 * {
 *   "startDate": "2025-02-03",
 *   "endDate": "2026-02-03",
 *   "contributions": {
 *     "2025-02-03": 1,
 *     "2025-02-04": 0,
 *     ...
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { ActivityLog } from '@/lib/models';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const sessionUser = session.user as { id?: string };
    if (!sessionUser.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Calculate date range (past 365 days)
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 364);
    startDate.setHours(0, 0, 0, 0);

    // Get contributions from ActivityLog
    const contributions = await ActivityLog.getContributions(
      sessionUser.id,
      startDate,
      endDate
    );

    // Fill in missing dates with 0
    const filledContributions: Record<string, number> = {};
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      filledContributions[dateStr] = contributions[dateStr] || 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      success: true,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      contributions: filledContributions,
      totalContributions: Object.values(filledContributions).reduce((a, b) => a + b, 0),
    });
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contributions' },
      { status: 500 }
    );
  }
}
