/**
 * ATS Score API
 * 
 * GET /api/ats-score
 * - Returns cached score if available
 * - Returns isOutdated flag
 * 
 * POST /api/ats-score
 * - Forces recalculation
 * - Updates cached score
 * - Marks evaluation as complete
 */

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils/api';
import {
    calculateATSScoreForActiveRole,
    getLatestATSScoreForActiveRole
} from '@/lib/services/ats/atsScoringService';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        const authResult = session?.user as { id: string } | undefined;

        if (!authResult || !authResult.id) {
            return errorResponse('Unauthorized', 401);
        }

        // Try to get cached score first
        let result = await getLatestATSScoreForActiveRole(authResult.id);

        // If no score exists (first time user), calculate it
        if (!result) {
            try {
                result = await calculateATSScoreForActiveRole(authResult.id);
                // Mark complete since we just calculated
                const { markEvaluationComplete } = await import('@/lib/services/evaluationService');
                await markEvaluationComplete(authResult.id, 'ats');
            } catch (calcError: any) {
                // If calculation fails (e.g. no resume), return error or null
                if (calcError.message?.includes('No active resume')) {
                    return errorResponse(calcError.message, 404);
                }
                throw calcError;
            }
        }

        if (!result) {
            return errorResponse('No active target role found. Please set a target role first.', 404);
        }

        // Get evaluation state
        const { getEvaluationState } = await import('@/lib/services/evaluationService');
        const evaluationState = await getEvaluationState(authResult.id);
        const isOutdated = evaluationState?.atsOutdated || false;

        return successResponse({
            atsScore: result,
            isOutdated
        });

    } catch (error: any) {
        console.error('Error fetching ATS score:', error);
        return errorResponse(error.message || 'Internal Server Error', 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const authResult = session?.user as { id: string } | undefined;

        if (!authResult || !authResult.id) {
            return errorResponse('Unauthorized', 401);
        }

        // Force recalculation
        const result = await calculateATSScoreForActiveRole(authResult.id);

        if (!result) {
            return errorResponse('No active target role found. Please set a target role first.', 404);
        }

        // Mark ATS evaluation as complete
        const { markEvaluationComplete } = await import('@/lib/services/evaluationService');
        await markEvaluationComplete(authResult.id, 'ats');

        return successResponse({
            atsScore: result,
            isOutdated: false
        });

    } catch (error: any) {
        console.error('Error calculating ATS score:', error);
        return errorResponse(error.message || 'Internal Server Error', 500);
    }
}
