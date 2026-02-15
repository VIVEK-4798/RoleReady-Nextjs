import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { mentorApplicationService } from '@/lib/services/mentorApplicationService';
import { successResponse, errors } from '@/lib/utils/api';

/**
 * Get current user's mentor application
 * GET /api/mentor-application/me
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) return errors.unauthorized();

        const application = await mentorApplicationService.getMyApplication(session.user.id);
        return successResponse(application);
    } catch (error) {
        console.error('GET /api/mentor-application/me error:', error);
        return errors.serverError();
    }
}
