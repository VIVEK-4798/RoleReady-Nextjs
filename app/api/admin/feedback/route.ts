import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { feedbackService } from '@/services/admin/feedbackService';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        // Check admin access
        if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const type = searchParams.get('type') || '';
        const status = searchParams.get('status') || '';
        const search = searchParams.get('search') || '';

        const result = await feedbackService.getFeedbackList({
            page,
            limit,
            type,
            status,
            search,
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error fetching admin feedback:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch feedback' },
            { status: 500 }
        );
    }
}
