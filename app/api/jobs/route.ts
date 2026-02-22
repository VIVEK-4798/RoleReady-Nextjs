import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { jobService } from '@/services/jobs/jobService';
import { jobPersonalizationService } from '@/services/jobs/jobPersonalizationService';
import { JobResponse } from '@/types/jobs';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);

    try {
        const session = await auth();
        const rawJobs = await jobService.getJobs(query, page);

        // Define meta for the response
        const meta = {
            total: rawJobs.length,
            page: page,
            limit: 20,
            totalPages: Math.ceil(rawJobs.length / 20) || 1
        };

        // If authenticated and on page 1, apply personalization
        if (session?.user?.id && page === 1 && !query) {
            const { recommended, others } = await jobPersonalizationService.rankJobsForUser(
                session.user.id,
                rawJobs
            );

            return NextResponse.json({
                recommended,
                others,
                meta
            });
        }

        // Guest user or search query - return flat list
        return NextResponse.json({
            data: rawJobs,
            meta
        });
    } catch (error) {
        console.error('API /api/jobs error:', error);
        return NextResponse.json({
            data: [],
            meta: { total: 0, page: 1, limit: 20, totalPages: 0 }
        });
    }
}
