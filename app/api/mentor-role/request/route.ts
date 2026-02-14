import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { mentorRoleRequestService } from '@/lib/services/mentorRoleRequestService';
import { successResponse, errors } from '@/lib/utils/api';

/**
 * Handle Mentor Role Request Creation
 * POST /api/mentor-role/request
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return errors.unauthorized();
        }

        const result = await mentorRoleRequestService.createRequest(session.user.id);

        if (!result.success) {
            return errors.badRequest(result.message);
        }

        return successResponse(result.data, result.message, 201);
    } catch (error) {
        console.error('POST /api/mentor-role/request error:', error);
        return errors.serverError();
    }
}
