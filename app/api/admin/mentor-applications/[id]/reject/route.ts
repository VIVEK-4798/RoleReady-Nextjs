import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { mentorApplicationService } from '@/lib/services/mentorApplicationService';
import { successResponse, errors } from '@/lib/utils/api';

/**
 * Reject mentor application (Admin)
 * POST /api/admin/mentor-applications/[id]/reject
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.id || (session.user as any).role !== 'admin') {
            return errors.forbidden('Admin access required');
        }

        const body = await request.json();
        const { reason } = body;

        if (!reason) return errors.badRequest('Rejection reason is required');

        const result = await mentorApplicationService.rejectApplication(params.id, session.user.id, reason);

        if (!result.success) return errors.badRequest(result.message);
        return successResponse(null, result.message);
    } catch (error) {
        console.error('POST /api/admin/mentor-applications/[id]/reject error:', error);
        return errors.serverError();
    }
}
