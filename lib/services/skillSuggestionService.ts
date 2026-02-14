import connectDB from '@/lib/db/mongoose';
import { Skill, ISkillDocument } from '@/lib/models';
import { IGitHubRepo } from '@/types';

/**
 * Service for suggesting skills based on GitHub repository metadata.
 */
export class SkillSuggestionService {
    /**
     * Generates skill suggestions from a list of repositories.
     * Matches primaryLanguage and topics against the global skill database.
     */
    static async suggestSkillsFromRepos(repos: IGitHubRepo[]): Promise<any[]> {
        await connectDB();

        // Collect unique potential skill names from languages and topics
        const skillSet = new Set<string>();

        repos.forEach(repo => {
            if (repo.primaryLanguage) {
                skillSet.add(repo.primaryLanguage);
            }
            repo.topics.forEach(topic => {
                // Basic normalization for common topics (e.g., 'reactjs' -> 'react')
                let normalizedTopic = topic.toLowerCase();
                if (normalizedTopic.endsWith('js')) {
                    skillSet.add(normalizedTopic.slice(0, -2));
                }
                skillSet.add(topic);
            });
        });

        const potentialNames = Array.from(skillSet);
        if (potentialNames.length === 0) return [];

        // Find actual matching skills in our database
        // @ts-ignore - statics method exists
        const matchedSkills = await Skill.findByNormalizedNames(potentialNames) as ISkillDocument[];

        return matchedSkills.map((skill: ISkillDocument) => ({
            id: skill._id.toString(),
            name: skill.name,
            domain: skill.domain,
        }));
    }
}
