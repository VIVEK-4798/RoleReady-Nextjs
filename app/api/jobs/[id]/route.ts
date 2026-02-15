import { NextRequest, NextResponse } from 'next/server';
import { getJobById } from '@/services/jobs/joinriseService';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = params.id;

    try {
        const job = await getJobById(id);
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }
        return NextResponse.json(job);
    } catch (error) {
        console.error(`API /api/jobs/${id} error:`, error);
        return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
    }
}
