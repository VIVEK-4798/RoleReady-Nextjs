/**
 * Mentor Validation Queue API - Grouped
 * 
 * GET /api/mentor/validation-queue
 * 
 * Returns a list of users with pending validations assigned to this mentor.
 * Grouped by user for high-level management.
 */

import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errors } from '@/lib/utils/api';
import { getUsersWithPendingValidations } from '@/lib/services/mentorQueueService';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Check mentor role
    if (!session?.user || (session.user as any).role !== 'mentor') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Mentor access required.' },
        { status: 403 }
      );
    }

    const mentorId = session.user.id;

    // Fetch grouped queue from service
    const users = await getUsersWithPendingValidations(mentorId!);

    return successResponse({
      users,
      totalUsers: users.length,
      totalPendingCount: users.reduce((acc, u) => acc + u.pendingCount, 0)
    });

  } catch (error) {
    console.error('GET /api/mentor/validation-queue error:', error);
    return errors.serverError('Failed to fetch validation queue');
  }
}
