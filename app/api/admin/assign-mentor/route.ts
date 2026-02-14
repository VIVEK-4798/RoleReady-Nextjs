/**
 * Admin API: Assign Mentor to User
 * 
 * POST /api/admin/assign-mentor
 * 
 * AUTHORIZATION: Admin only
 * 
 * REQUEST BODY:
 * {
 *   userId: string;
 *   mentorId: string;
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { assignMentorToUser } from '@/lib/services/mentorAssignmentService';
import type { AssignMentorRequest } from '@/types/mentor';

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
        const body: AssignMentorRequest = await request.json();
        const { userId, mentorId } = body;

        // Validate input
        if (!userId || !mentorId) {
            return NextResponse.json(
                { success: false, error: 'userId and mentorId are required' },
                { status: 400 }
            );
        }

        // Assign mentor using service
        const result = await assignMentorToUser(userId, mentorId, currentUser.id!);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: result.message,
            data: result.assignment,
        });

    } catch (error) {
        console.error('Error in assign-mentor API:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
