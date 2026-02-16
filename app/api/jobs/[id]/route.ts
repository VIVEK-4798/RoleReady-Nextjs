import { NextRequest, NextResponse } from 'next/server';
import { jobAggregatorService } from '@/services/jobs/jobAggregatorService';

export async function GET(
    request: NextRequest,
    context: any
) {
    const { id } = await context.params;
    // ... rest of the code is fine.

    try {
        const job = await jobAggregatorService.getJobById(id);
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }
        return NextResponse.json(job);
    } catch (error) {
        console.error(`API /api/jobs/${id} error:`, error);
        return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
    }
}
