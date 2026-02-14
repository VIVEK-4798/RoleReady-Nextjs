import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { mentorRoleRequestService } from '@/lib/services/mentorRoleRequestService';
import { successResponse, errors } from '@/lib/utils/api';

/**
 * Get current user's mentor request status
 * GET /api/mentor-role/me
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return errors.unauthorized();
        }

        const requestData = await mentorRoleRequestService.getMyRequest(session.user.id);

        return successResponse(requestData);
    } catch (error) {
        console.error('GET /api/mentor-role/me error:', error);
        return errors.serverError();
    }
}
