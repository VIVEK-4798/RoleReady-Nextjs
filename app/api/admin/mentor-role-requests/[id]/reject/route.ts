import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { mentorRoleRequestService } from '@/lib/services/mentorRoleRequestService';
import { successResponse, errors } from '@/lib/utils/api';

/**
 * Reject a mentor role request (Admin only)
 * POST /api/admin/mentor-role-requests/[id]/reject
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        const adminId = session?.user?.id;
        if (!adminId || (session.user as any).role !== 'admin') {
            return errors.forbidden('Admin access required');
        }

        const requestId = params.id;
        if (!requestId) {
            return errors.badRequest('Request ID is required');
        }

        const body = await request.json();
        const { reason } = body;

        if (!reason) {
            return errors.validationError('Rejection reason is required');
        }

        const result = await mentorRoleRequestService.rejectRequest(requestId, adminId, reason);

        if (!result.success) {
            return errors.badRequest(result.message);
        }

        return successResponse(null, result.message);
    } catch (error) {
        console.error('POST /api/admin/mentor-role-requests/[id]/reject error:', error);
        return errors.serverError();
    }
}
