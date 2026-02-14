/**
 * Mentor Validation Queue API - User Specific
 * 
 * GET /api/mentor/validation-queue/[userId]
 * 
 * Returns all pending skills for a specific student assigned to this mentor.
 */

import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errors } from '@/lib/utils/api';
import { getPendingSkillsForUser } from '@/lib/services/mentorQueueService';
import { auth } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params;
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

        if (!userId) {
            return errors.badRequest('User ID is required');
        }

        // Fetch user-specific pending skills via service
        const data = await getPendingSkillsForUser(mentorId!, userId);

        return successResponse(data);

    } catch (error) {
        console.error(`GET /api/mentor/validation-queue/${userId} error:`, error);
        return errors.serverError('Failed to fetch user skills');
    }
}
