import { AggregatedJob } from '@/types/jobs';
import connectDB from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import Role from '@/lib/models/Role';

/**
 * Keyword mapping for common roles to help with deterministic matching.
 * This is the core logic for Phase 2 personalization.
 */
const ROLE_KEYWORDS: Record<string, string[]> = {
    "frontend developer": ["frontend", "react", "ui", "web", "javascript", "tailwind", "next.js", "angular", "vue", "css"],
    "backend developer": ["backend", "api", "server", "node", "java", "spring", "django", "python", "mongodb", "postgresql", "sql", "redis"],
    "fullstack developer": ["fullstack", "frontend", "backend", "react", "node", "express", "api", "mongodb", "typescript"],
    "data scientist": ["data", "science", "python", "machine learning", "ai", "pandas", "numpy", "pytorch", "tensorflow", "r"],
    "data analyst": ["data", "analysis", "sql", "excel", "tableau", "power bi", "visualization"],
    "devops engineer": ["devops", "cloud", "aws", "azure", "docker", "kubernetes", "jenkins", "cicd", "terraform", "infrastructure"],
    "mobile developer": ["mobile", "android", "ios", "react native", "flutter", "kotlin", "swift", "app"],
    "ui/ux designer": ["ui", "ux", "design", "figma", "sketch", "adobe xd", "wireframe", "prototyping"],
    "qa engineer": ["qa", "testing", "automation", "selenium", "cypress", "jest", "quality assurance"],
    "product manager": ["product", "roadmap", "agile", "scrum", "stakeholder", "strategy"],
    "internship": ["intern", "trainee", "fresher", "junior", "learning"]
};

export class JobPersonalizationService {
    /**
     * Sorts and categorizes jobs based on a user's target role.
     * @param userId The ID of the authenticated user
     * @param jobs List of aggregated jobs to rank
     */
    async rankJobsForUser(userId: string, jobs: AggregatedJob[]): Promise<{ recommended: AggregatedJob[], others: AggregatedJob[] }> {
        try {
            await connectDB();

            // 1. Fetch user and their target role
            const user = await User.findById(userId).populate('profile.targetRoleId');
            if (!user || !user.profile?.targetRoleId) {
                return { recommended: [], others: jobs };
            }

            // @ts-ignore - targetRoleId is populated and has name
            const roleName = user.profile.targetRoleId.name.toLowerCase();

            // 2. Identify relevant keywords for the role
            // We look for direct matches in our map or partial matches if not found
            let keywords: string[] = [];
            for (const [key, val] of Object.entries(ROLE_KEYWORDS)) {
                if (roleName.includes(key)) {
                    keywords = [...keywords, ...val];
                }
            }

            // If no mapping found, use the role name itself as keywords
            if (keywords.length === 0) {
                keywords = roleName.split(/\s+/).filter((k: string) => k.length > 2);
            }

            // 3. For each job: calculate relevance score
            const rankedJobs = jobs.map(job => {
                let score = 0;
                const title = job.title.toLowerCase();
                const description = (job.description || '').toLowerCase();

                keywords.forEach(keyword => {
                    // +2 if keyword in title
                    if (title.includes(keyword)) score += 2;
                    // +1 if in description
                    if (description.includes(keyword)) score += 1;
                });

                return { ...job, matchScore: score };
            });

            // 4. Sort descending by score
            rankedJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

            // 5. Categorize (Threshold: score > 2 means at least 1 title match or 3 desc matches)
            const RECOMMENDED_THRESHOLD = 2;
            const recommended = rankedJobs.filter(j => (j.matchScore || 0) >= RECOMMENDED_THRESHOLD);
            const others = rankedJobs.filter(j => (j.matchScore || 0) < RECOMMENDED_THRESHOLD);

            return { recommended, others };
        } catch (error) {
            console.error('Job personalization error:', error);
            return { recommended: [], others: jobs };
        }
    }
}

export const jobPersonalizationService = new JobPersonalizationService();
