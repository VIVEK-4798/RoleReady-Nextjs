import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { mentorApplicationService } from '@/lib/services/mentorApplicationService';
import { successResponse, errors } from '@/lib/utils/api';

/**
 * Approve mentor application (Admin)
 * POST /api/admin/mentor-applications/[id]/approve
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

        const result = await mentorApplicationService.approveApplication(params.id, session.user.id);

        if (!result.success) return errors.badRequest(result.message);
        return successResponse(null, result.message);
    } catch (error) {
        console.error('POST /api/admin/mentor-applications/[id]/approve error:', error);
        return errors.serverError();
    }
}
