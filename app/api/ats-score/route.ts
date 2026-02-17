/**
 * ATS Score API Route
 * 
 * GET /api/ats-score
 * 
 * Returns ATS compatibility score for the logged-in user's active target role.
 */

import { NextRequest } from 'next/server';
import { successResponse, errors } from '@/lib/utils/api';
import { requireAuth } from '@/lib/auth/utils';
import { calculateATSScoreForActiveRole } from '@/lib/services/ats/atsScoringService';

export async function GET(request: NextRequest) {
    try {
        // Require authentication
        const authResult = await requireAuth();
        if ('error' in authResult) return authResult.error;

        if (!authResult.id) return errors.unauthorized('Authentication required');

        // Calculate ATS score for active target role
        const result = await calculateATSScoreForActiveRole(authResult.id);

        if (!result) {
            return errors.notFound('No active target role found. Please set a target role first.');
        }

        return successResponse({
            atsScore: result
        });

    } catch (error: any) {
        console.error('GET /api/ats-score error:', error);

        // Handle specific errors
        if (error.message?.includes('No active resume')) {
            return errors.notFound(error.message);
        }
        if (error.message?.includes('not been parsed')) {
            return errors.badRequest(error.message);
        }
        if (error.message?.includes('Role not found')) {
            return errors.notFound(error.message);
        }

        return errors.serverError('Failed to calculate ATS score');
    }
}
