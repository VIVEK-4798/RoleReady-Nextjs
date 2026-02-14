import { IGitHubRepo } from '@/types';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';

/**
 * Service for fetching and normalizing repository data from GitHub.
 */
export class GitHubImportService {
    /**
     * Fetches the GitHub access token for a user.
     * Token is stored in the database but excluded from default queries for security.
     */
    private static async getAccessToken(userId: string): Promise<string> {
        await connectDB();
        console.log('[GitHubImportService] Getting token for userId:', userId);
        const user = await User.findById(userId).select('+githubAccessToken');

        if (!user) {
            console.error('[GitHubImportService] User not found in DB for ID:', userId);
            throw new Error('User profile not found. Please try logging out and in again.');
        }

        console.log('[GitHubImportService] User object keys loaded:', Object.keys(user.toObject()).filter(k => !k.startsWith('_')));

        if (!user.githubAccessToken) {
            console.error('[GitHubImportService] githubAccessToken is missing for user:', user.email);
            throw new Error('GitHub access token not found. Please reconnect your GitHub account.');
        }

        console.log('[GitHubImportService] Token successfully retrieved for:', user.email);
        return user.githubAccessToken;
    }

    /**
     * Fetches all repositories for the authenticated user from GitHub.
     * Implements filtering and normalization.
     */
    static async fetchUserRepositories(userId: string): Promise<IGitHubRepo[]> {
        const token = await this.getAccessToken(userId);

        try {
            const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=pushed', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('GitHub session expired. Please log in again.');
                }
                throw new Error(`GitHub API error: ${response.statusText}`);
            }

            const repos = await response.json();

            // Normalize and filter repos
            return repos
                .filter((repo: any) => {
                    // Filtering Rules:
                    // 1. Must have a name
                    // 2. Cannot be a fork (unless we want to allow it later)
                    // 3. Must be recent (last push within 2 years, adjustable)
                    const twoYearsAgo = new Date();
                    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
                    const pushDate = new Date(repo.pushed_at);

                    return (
                        repo.name &&
                        !repo.fork &&
                        pushDate > twoYearsAgo
                    );
                })
                .map((repo: any): IGitHubRepo => ({
                    id: repo.id.toString(),
                    name: repo.name,
                    description: repo.description,
                    htmlUrl: repo.html_url,
                    primaryLanguage: repo.language,
                    topics: repo.topics || [],
                    stars: repo.stargazers_count,
                    forks: repo.forks_count,
                    updatedAt: repo.pushed_at,
                    isFork: repo.fork,
                }));
        } catch (error) {
            console.error('[GitHubImportService] fetchUserRepositories error:', error);
            throw error;
        }
    }
}
