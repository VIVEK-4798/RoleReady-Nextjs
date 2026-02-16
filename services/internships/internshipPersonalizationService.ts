import { InternshipDTO } from '@/types/internships';
import connectDB from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import Role from '@/lib/models/Role';

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

export class InternshipPersonalizationService {
    async rankInternshipsForUser(userId: string, internships: InternshipDTO[]): Promise<{ recommended: InternshipDTO[], others: InternshipDTO[] }> {
        try {
            await connectDB();

            const user = await User.findById(userId).populate('profile.targetRoleId');
            if (!user || !user.profile?.targetRoleId) {
                return { recommended: [], others: internships };
            }

            // @ts-ignore
            const roleName = user.profile.targetRoleId.name.toLowerCase();

            let keywords: string[] = [];
            for (const [key, val] of Object.entries(ROLE_KEYWORDS)) {
                if (roleName.includes(key)) {
                    keywords = [...keywords, ...val];
                }
            }

            if (keywords.length === 0) {
                keywords = roleName.split(/\s+/).filter((k: string) => k.length > 2);
            }

            const ranked = internships.map(internship => {
                let score = 0;
                const title = internship.title.toLowerCase();
                const description = (internship.description || '').toLowerCase();

                keywords.forEach(keyword => {
                    if (title.includes(keyword)) score += 2;
                    if (description.includes(keyword)) score += 1;
                });

                return { ...internship, matchScore: score };
            });

            ranked.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

            const RECOMMENDED_THRESHOLD = 2;
            const recommended = ranked.filter(j => (j.matchScore || 0) >= RECOMMENDED_THRESHOLD);
            const others = ranked.filter(j => (j.matchScore || 0) < RECOMMENDED_THRESHOLD);

            return { recommended, others };
        } catch (error) {
            console.error('Internship personalization error:', error);
            return { recommended: [], others: internships };
        }
    }
}

export const internshipPersonalizationService = new InternshipPersonalizationService();
