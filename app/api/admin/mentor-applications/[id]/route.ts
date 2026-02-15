import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { mentorApplicationService } from '@/lib/services/mentorApplicationService';
import { successResponse, errors } from '@/lib/utils/api';

/**
 * Get mentor application details (Admin)
 * GET /api/admin/mentor-applications/[id]
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();
        if (!session?.user?.id || (session.user as any).role !== 'admin') {
            return errors.forbidden('Admin access required');
        }

        const application = await mentorApplicationService.getApplicationById(id);
        if (!application) return errors.notFound('Application');

        return successResponse(application);
    } catch (error) {
        console.error('GET /api/admin/mentor-applications/[id] error:', error);
        return errors.serverError();
    }
}
