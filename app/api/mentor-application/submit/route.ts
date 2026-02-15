import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { mentorApplicationService } from '@/lib/services/mentorApplicationService';
import { successResponse, errors } from '@/lib/utils/api';

/**
 * Submit mentor application
 * POST /api/mentor-application/submit
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) return errors.unauthorized();

        const result = await mentorApplicationService.submitApplication(session.user.id);

        if (!result.success) return errors.badRequest(result.message);
        return successResponse(result.data, result.message);
    } catch (error) {
        console.error('POST /api/mentor-application/submit error:', error);
        return errors.serverError();
    }
}
