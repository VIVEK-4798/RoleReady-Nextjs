import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ProjectImportService } from '@/lib/services/projectImportService';

export async function POST(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { repoIds } = body;

        if (!repoIds || !Array.isArray(repoIds) || repoIds.length === 0) {
            return NextResponse.json({ error: 'No repositories selected' }, { status: 400 });
        }

        const importedProjects = await ProjectImportService.importRepositories(session.user.id, repoIds);

        return NextResponse.json({
            success: true,
            message: `Successfully imported ${importedProjects.length} projects.`,
            data: { importedCount: importedProjects.length }
        });
    } catch (error: any) {
        console.error('[API/GitHub/Import] POST Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to import repositories' },
            { status: 500 }
        );
    }
}
