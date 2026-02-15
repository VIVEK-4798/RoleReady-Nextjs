import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { mentorApplicationService } from '@/lib/services/mentorApplicationService';
import { successResponse, errors } from '@/lib/utils/api';

/**
 * Create or update mentor application draft
 * POST /api/mentor-application/draft
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) return errors.unauthorized();

        const body = await request.json();
        const result = await mentorApplicationService.createOrUpdateDraft(session.user.id, body);

        if (!result.success) return errors.badRequest(result.message);
        return successResponse(result.data, result.message);
    } catch (error) {
        console.error('POST /api/mentor-application/draft error:', error);
        return errors.serverError();
    }
}
