import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GitHubImportService } from '@/lib/services/githubImportService';

export async function GET(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const repos = await GitHubImportService.fetchUserRepositories(session.user.id);
        return NextResponse.json({ success: true, data: repos });
    } catch (error: any) {
        console.error('[API/GitHub/Repos] GET Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch repositories' },
            { status: 500 }
        );
    }
}
