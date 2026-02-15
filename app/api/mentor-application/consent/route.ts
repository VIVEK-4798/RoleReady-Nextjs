import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { mentorApplicationService } from '@/lib/services/mentorApplicationService';
import { successResponse, errors } from '@/lib/utils/api';

/**
 * Record role change consent
 * POST /api/mentor-application/consent
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) return errors.unauthorized();

        const { accepted, version } = await request.json();

        if (accepted === undefined) return errors.badRequest('Missing accepted status');

        const result = await mentorApplicationService.recordConsent(session.user.id, accepted, version);

        if (!result.success) return errors.badRequest(result.message);
        return successResponse(result.data, result.message);
    } catch (error) {
        console.error('POST /api/mentor-application/consent error:', error);
        return errors.serverError();
    }
}
