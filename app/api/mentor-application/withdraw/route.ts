import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { mentorApplicationService } from '@/lib/services/mentorApplicationService';
import { successResponse, errors } from '@/lib/utils/api';

/**
 * Withdraw mentor application (Delete it)
 * POST /api/mentor-application/withdraw
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) return errors.unauthorized();

        const result = await mentorApplicationService.withdrawApplication(session.user.id);

        if (!result.success) return errors.badRequest(result.message);
        return successResponse(null, result.message);
    } catch (error) {
        console.error('POST /api/mentor-application/withdraw error:', error);
        return errors.serverError();
    }
}
