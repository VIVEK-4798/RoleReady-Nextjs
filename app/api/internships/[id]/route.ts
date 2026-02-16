import { NextRequest, NextResponse } from 'next/server';
import { internshipAggregatorService } from '@/services/internships/internshipAggregatorService';

export async function GET(
    request: NextRequest,
    context: any
) {
    const { id } = await context.params;

    try {
        const internship = await internshipAggregatorService.getInternshipById(id);
        if (!internship) {
            return NextResponse.json({ error: 'Internship not found' }, { status: 404 });
        }
        return NextResponse.json(internship);
    } catch (error) {
        console.error(`API /api/internships/${id} error:`, error);
        return NextResponse.json({ error: 'Failed to fetch internship' }, { status: 500 });
    }
}
