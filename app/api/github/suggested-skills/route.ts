import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GitHubImportService } from '@/lib/services/githubImportService';
import { SkillSuggestionService } from '@/lib/services/skillSuggestionService';

export async function GET(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const repoIdsString = searchParams.get('repoIds');

        if (!repoIdsString) {
            return NextResponse.json({ error: 'No repositories specified' }, { status: 400 });
        }

        const repoIds = repoIdsString.split(',');

        // Fetch repo data (could be cached)
        const allRepos = await GitHubImportService.fetchUserRepositories(session.user.id);
        const selectedRepos = allRepos.filter(repo => repoIds.includes(repo.id));

        const suggestions = await SkillSuggestionService.suggestSkillsFromRepos(selectedRepos);

        return NextResponse.json({ success: true, data: suggestions });
    } catch (error: any) {
        console.error('[API/GitHub/Skills] GET Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate skill suggestions' },
            { status: 500 }
        );
    }
}
