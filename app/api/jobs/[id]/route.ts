import { NextRequest, NextResponse } from 'next/server';
import { jobService } from '@/services/jobs/jobService';

export async function GET(
    request: NextRequest,
    context: any
) {
    const { id } = await context.params;

    try {
        const job = await jobService.getJobById(id);
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }
        return NextResponse.json(job);
    } catch (error) {
        console.error(`API /api/jobs/${id} error:`, error);
        return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
    }
}
