import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { mentorRoleRequestService } from '@/lib/services/mentorRoleRequestService';
import { successResponse, errors } from '@/lib/utils/api';

/**
 * List all pending mentor role requests (Admin only)
 * GET /api/admin/mentor-role-requests
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || (session.user as any).role !== 'admin') {
            return errors.forbidden('Admin access required');
        }

        const requests = await mentorRoleRequestService.listPendingRequests();

        return successResponse(requests);
    } catch (error) {
        console.error('GET /api/admin/mentor-role-requests error:', error);
        return errors.serverError();
    }
}
