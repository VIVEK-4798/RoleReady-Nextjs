import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';
import { IGitHubRepo } from '@/types';
import { GitHubImportService } from './githubImportService';

/**
 * Service for importing selected GitHub repositories into a user's profile as projects.
 */
export class ProjectImportService {
    /**
     * Imports selected repositories into the user's profile.
     */
    static async importRepositories(userId: string, repoIds: string[]): Promise<any[]> {
        await connectDB();

        // 1. Fetch user's repos again to verify and get data (safe approach)
        // In a high-traffic app, we might cache this in Redis.
        const allRepos = await GitHubImportService.fetchUserRepositories(userId);
        const selectedRepos = allRepos.filter(repo => repoIds.includes(repo.id));

        if (selectedRepos.length === 0) {
            throw new Error('No valid repositories selected for import.');
        }

        const user = await User.findById(userId);
        if (!user) throw new Error('User not found.');

        const currentProjects = user.profile?.projects || [];
        const importedProjects: any[] = [];
        let skippedCount = 0;

        for (const repo of selectedRepos) {
            // Prevent duplicates by checking githubUrl
            const exists = currentProjects.some(p => p.githubUrl === repo.htmlUrl);

            if (exists) {
                skippedCount++;
                continue;
            }

            const newProject = {
                name: repo.name,
                description: repo.description || `A project built using ${repo.primaryLanguage || 'various technologies'}.`,
                githubUrl: repo.htmlUrl,
                url: repo.htmlUrl, // Default to GitHub URL if no homepage
                technologies: repo.primaryLanguage ? [repo.primaryLanguage, ...repo.topics] : repo.topics,
                startDate: new Date(repo.updatedAt), // Simplification: use push date as start for now
                isOngoing: true,
            };

            currentProjects.push(newProject);
            importedProjects.push(newProject);
        }

        if (importedProjects.length > 0) {
            user.profile.projects = currentProjects;
            await user.save();
        }

        return importedProjects;
    }
}
