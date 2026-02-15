import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { mentorApplicationService } from '@/lib/services/mentorApplicationService';
import { successResponse, errors } from '@/lib/utils/api';

/**
 * List submitted mentor applications (Admin)
 * GET /api/admin/mentor-applications
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id || (session.user as any).role !== 'admin') {
            return errors.forbidden('Admin access required');
        }

        const applications = await mentorApplicationService.listSubmittedApplications();
        return successResponse(applications);
    } catch (error) {
        console.error('GET /api/admin/mentor-applications error:', error);
        return errors.serverError();
    }
}
