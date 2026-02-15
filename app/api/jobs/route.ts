import { NextRequest, NextResponse } from 'next/server';
import { searchJobs } from '@/services/jobs/joinriseService';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);

    try {
        const jobs = await searchJobs(query, page);
        return NextResponse.json(jobs);
    } catch (error) {
        console.error('API /api/jobs error:', error);
        return NextResponse.json([], { status: 200 }); // Return empty array as per requirements
    }
}
