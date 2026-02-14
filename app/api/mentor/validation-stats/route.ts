/**
 * Mentor Validation Statistics API
 * 
 * GET /api/mentor/validation-stats
 * 
 * Returns statistics for the authenticated mentor's assigned users.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMentorValidationStats } from '@/lib/services/mentorQueueService';

export async function GET() {
    try {
        const session = await auth();

        // Check authentication and mentor role
        if (!session?.user || (session.user as any).role !== 'mentor') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Mentor access required.' },
                { status: 401 }
            );
        }

        const mentorId = session.user.id;
        if (!mentorId) {
            return NextResponse.json(
                { success: false, error: 'User ID not found in session' },
                { status: 400 }
            );
        }

        // Get statistics
        const stats = await getMentorValidationStats(mentorId);

        return NextResponse.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('GET /api/mentor/validation-stats error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch validation statistics' },
            { status: 500 }
        );
    }
}
