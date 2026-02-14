/**
 * Admin API: Change User's Mentor
 * 
 * POST /api/admin/change-mentor
 * 
 * AUTHORIZATION: Admin only
 * 
 * REQUEST BODY:
 * {
 *   userId: string;
 *   newMentorId: string | null;  // null to unassign
 *   reason?: string;
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { changeMentor } from '@/lib/services/mentorAssignmentService';
import type { ChangeMentorRequest } from '@/types/mentor';

export async function POST(request: NextRequest) {
    try {
        // Verify admin authentication
        const currentUser = await getCurrentUser();

        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Admin access required.' },
                { status: 403 }
            );
        }

        // Parse request body
        const body: ChangeMentorRequest = await request.json();
        const { userId, newMentorId, reason } = body;

        // Validate input
        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'userId is required' },
                { status: 400 }
            );
        }

        // Change mentor using service
        const result = await changeMentor(userId, newMentorId, currentUser.id!);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: result.message,
            data: {
                previousMentorId: result.previousMentorId,
                newMentorId: result.newMentorId,
                reason,
            },
        });

    } catch (error) {
        console.error('Error in change-mentor API:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
