/**
 * Mentor API: Get My Assigned Users
 * 
 * GET /api/mentor/my-users
 * 
 * AUTHORIZATION: Mentor only
 * 
 * RETURNS: List of users assigned to the authenticated mentor
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUsersByMentor } from '@/lib/services/mentorAssignmentService';

export async function GET(request: NextRequest) {
    try {
        // Verify mentor authentication
        const currentUser = await getCurrentUser();

        if (!currentUser || currentUser.role !== 'mentor') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Mentor access required.' },
                { status: 403 }
            );
        }

        // Get users assigned to this mentor
        const users = await getUsersByMentor(currentUser.id!);

        return NextResponse.json({
            success: true,
            users,
            total: users.length,
        });

    } catch (error) {
        console.error('Error in my-users API:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
