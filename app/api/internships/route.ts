import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { internshipAggregatorService } from '@/services/internships/internshipAggregatorService';
import { internshipPersonalizationService } from '@/services/internships/internshipPersonalizationService';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);

    try {
        const session = await auth();
        const rawItems = await internshipAggregatorService.fetchAggregatedInternships(query, page);

        const meta = {
            total: rawItems.length,
            page: page,
            limit: 20,
            totalPages: Math.ceil(rawItems.length / 20) || 1
        };

        if (session?.user?.id && page === 1 && !query) {
            const { recommended, others } = await internshipPersonalizationService.rankInternshipsForUser(
                session.user.id,
                rawItems
            );

            return NextResponse.json({
                recommended,
                others,
                meta
            });
        }

        return NextResponse.json({
            data: rawItems,
            meta
        });
    } catch (error) {
        console.error('API /api/internships error:', error);
        return NextResponse.json({
            data: [],
            meta: { total: 0, page: 1, limit: 20, totalPages: 0 }
        });
    }
}
