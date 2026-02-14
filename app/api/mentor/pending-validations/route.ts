/**
 * Mentor API: Get Pending Validations
 * 
 * GET /api/mentor/pending-validations
 * 
 * AUTHORIZATION: Mentor only
 * 
 * STRICT FILTERING: Only returns validations from users assigned to this mentor
 * 
 * RETURNS: List of pending skill validations from assigned users
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
    getPendingValidationsForMentor,
    getMentorValidationStats
} from '@/lib/services/mentorQueueService';

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

        // Get pending validations ONLY from assigned users
        const [validations, stats] = await Promise.all([
            getPendingValidationsForMentor(currentUser.id!),
            getMentorValidationStats(currentUser.id!),
        ]);

        return NextResponse.json({
            success: true,
            validations,
            stats,
            total: validations.length,
        });

    } catch (error) {
        console.error('Error in pending-validations API:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
