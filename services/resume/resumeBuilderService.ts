import Skill from '@/lib/models/Skill';
import User from '@/lib/models/User';
import UserSkill from '@/lib/models/UserSkill';
import connectDB from '@/lib/db/mongoose';
import { ResumeData } from '@/types/resume';
import { SkillLevel } from '@/types';
import { format } from 'date-fns';

const LEVEL_ORDER: Record<SkillLevel, number> = {
    expert: 5,
    advanced: 4,
    intermediate: 3,
    beginner: 2,
    none: 1
};

const SKILL_CATEGORIES: Record<string, string[]> = {
    'Frontend': ['react', 'next.js', 'javascript', 'typescript', 'html', 'css', 'tailwind', 'vue', 'angular', 'svelte', 'bootstrap', 'ui', 'ux', 'frontend'],
    'Backend': ['node.js', 'express.js', 'python', 'django', 'flask', 'go', 'java', 'spring', 'php', 'laravel', 'ruby', 'rails', 'backend', 'auth'],
    'Database': ['mongodb', 'postgresql', 'mysql', 'redis', 'sqlite', 'oracle', 'firebase', 'mongoose', 'prisma', 'sql', 'nosql', 'db'],
    'Integrations': ['razorpay', 'stripe', 'paypal', 'firebase', 'aws', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'rest', 'api', 'cloudinary', 'multer', 'stripe']
};

/**
 * Clean text by removing duplicate sentences, extra whitespace, and unprofessional phrases
 */
function cleanDescription(text: string): string {
    if (!text) return '';

    // Remove specific problematic phrases
    let cleanedText = text.replace(/you are made for the best/gi, '');

    // Split by common sentence delimiters, but handle tech characters like .js correctly
    const sentences = cleanedText.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s+/);

    const uniqueSentences: string[] = [];
    const seenSentences = new Set<string>();

    sentences.forEach(s => {
        const trimmed = s.trim();
        const low = trimmed.toLowerCase();

        // Skip placeholders and duplicates
        const isPlaceholder = [
            'placeholder', 'test description', 'lorem ipsum', 'coming soon', 'working on it',
            'write something', 'add more info', '...', 'not specified'
        ].some(p => low.includes(p));

        if (trimmed.length > 5 && !isPlaceholder && !seenSentences.has(low)) {
            uniqueSentences.push(trimmed);
            seenSentences.add(low);
        }
    });

    return uniqueSentences.join('. ');
}

/**
 * Format description into professional bullet points
 */
function formatToBullets(text: string): string[] {
    const cleaned = cleanDescription(text);
    if (!cleaned) return [];

    let sentences = cleaned.split(/(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 5);

    const actionVerbsMap: Record<string, string> = {
        'i build': 'Developed',
        'i built': 'Developed',
        'i make': 'Created',
        'i made': 'Designed',
        'i create': 'Architected',
        'i created': 'Architected',
        'i use': 'Utilized',
        'i used': 'Leveraged',
        'i work': 'Collaborated',
        'i worked': 'Collaborated',
        'i help': 'Facilitated',
        'i helped': 'Facilitated',
        'i manage': 'Orchestrated',
        'i managed': 'Lead',
        'i dived': 'Specialized',
    };

    return sentences.map(s => {
        let sentence = s;
        // Basic capitalization
        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);

        // Apply resume-style transformations
        Object.keys(actionVerbsMap).forEach(key => {
            const regex = new RegExp(`^${key}`, 'i');
            if (regex.test(sentence)) {
                sentence = sentence.replace(regex, actionVerbsMap[key]);
            }
        });

        // Clean trailing periods
        if (sentence.endsWith('.')) sentence = sentence.slice(0, -1);

        return sentence;
    });
}

/**
 * Infer professional role from skills
 */
function inferRole(skillNames: string[]): string {
    const lowSkills = skillNames.map(s => s.toLowerCase());
    const hasFrontend = lowSkills.some(s => SKILL_CATEGORIES['Frontend'].some(k => s.includes(k)));
    const hasBackend = lowSkills.some(s => SKILL_CATEGORIES['Backend'].some(k => s.includes(k)));

    if (hasFrontend && hasBackend) return 'Full Stack Developer';
    if (hasFrontend) return 'Frontend Developer';
    if (hasBackend) return 'Backend Developer';
    return 'Software Developer';
}

/**
 * Group skills by category
 */
function groupSkills(skills: { name: string, level: string }[]): Record<string, string[]> {
    const groups: Record<string, string[]> = {};

    skills.forEach(skill => {
        let categorized = false;
        const lowName = skill.name.toLowerCase();

        for (const [category, keywords] of Object.entries(SKILL_CATEGORIES)) {
            if (keywords.some(k => lowName.includes(k))) {
                if (!groups[category]) groups[category] = [];
                groups[category].push(skill.name);
                categorized = true;
                break;
            }
        }

        if (!categorized) {
            if (!groups['Tools & Others']) groups['Tools & Others'] = [];
            groups['Tools & Others'].push(skill.name);
        }
    });

    return groups;
}

export async function buildResumeData(userId: string): Promise<ResumeData> {
    await connectDB();

    const user = await User.findById(userId).lean();
    if (!user) {
        throw new Error('User not found');
    }

    // Fetch and filter skills
    const userSkillsRaw = await UserSkill.find({
        userId: user._id,
        level: { $ne: 'none' },
        validationStatus: { $ne: 'rejected' }
    }).populate({ path: 'skillId', model: Skill }).lean();

    const skills = userSkillsRaw
        .map((us: any) => ({
            name: us.skillId?.name || 'Unknown Skill',
            level: us.level as SkillLevel
        }))
        .sort((a, b) => LEVEL_ORDER[b.level] - LEVEL_ORDER[a.level]);

    const skillNames = skills.map(s => s.name);
    const inferredRole = inferRole(skillNames);
    const groupedSkills = groupSkills(skills);

    const formatDate = (date?: Date | string) => {
        if (!date) return 'Present';
        try {
            return format(new Date(date), 'MMM yyyy');
        } catch (e) {
            return 'Present';
        }
    };

    // Summary Enrichment
    let summary = cleanDescription(user.profile?.about || user.profile?.bio || '');
    if (summary.length < 80 && skillNames.length >= 3) {
        const topSkillsGroup = skillNames.slice(0, 5).join(', ');
        summary = `${inferredRole} with hands-on experience in ${topSkillsGroup}. Skilled in building scalable applications and implementing robust technical solutions using modern development frameworks.`;
    }

    const resumeData: ResumeData = {
        contact: {
            fullName: user.name,
            email: user.email,
            phone: user.mobile,
            linkedin: user.profile?.linkedinUrl || user.profile?.socialLinks?.linkedin,
            github: user.profile?.githubUrl || user.profile?.socialLinks?.github || (user.githubUsername ? `https://github.com/${user.githubUsername}` : undefined),
            portfolio: user.profile?.portfolioUrl || user.profile?.socialLinks?.portfolio,
            location: user.profile?.location,
            headline: user.profile?.headline
        },
        summary: summary.length >= 40 ? summary : undefined,
        skills,
        groupedSkills,
        experience: (user.profile?.experience || [])
            .map((exp: any) => {
                const bullets = formatToBullets(exp.description || '');
                return {
                    title: exp.title,
                    company: exp.company,
                    location: exp.location,
                    startDate: formatDate(exp.startDate),
                    endDate: exp.isCurrent ? 'Present' : formatDate(exp.endDate),
                    isCurrent: exp.isCurrent,
                    description: bullets.length >= 2 ? bullets.slice(0, 4).join('\n') : undefined
                };
            })
            .filter((exp: any) => exp.title && exp.company && exp.description),
        projects: (user.profile?.projects || [])
            .map((proj: any) => {
                let bullets = formatToBullets(proj.description || '');
                const techs = proj.technologies || [];

                // Enrichment for projects
                if (bullets.length < 2 && techs.length > 0) {
                    const lowTechs = techs.map((t: string) => t.toLowerCase());
                    if (lowTechs.some((t: string) => t.includes('react') || t.includes('next'))) {
                        bullets.push(`Developed a dynamic frontend interface using ${techs.find((t: string) => t.toLowerCase().includes('react') || t.toLowerCase().includes('next'))}.`);
                    }
                    if (lowTechs.some((t: string) => t.includes('node') || t.includes('express'))) {
                        bullets.push(`Implemented reliable backend services and REST APIs with ${techs.find((t: string) => t.toLowerCase().includes('node') || t.toLowerCase().includes('express'))}.`);
                    }
                    if (lowTechs.some((t: string) => t.includes('razorpay') || t.includes('stripe'))) {
                        bullets.push(`Integrated secure payment processing using ${techs.find((t: string) => t.toLowerCase().includes('razorpay') || t.toLowerCase().includes('stripe'))}.`);
                    }
                    if (lowTechs.some((t: string) => t.includes('mongo') || t.includes('sql') || t.includes('db'))) {
                        bullets.push(`Architected efficient data storage solutions with ${techs.find((t: string) => t.toLowerCase().includes('mongo') || t.toLowerCase().includes('sql') || t.toLowerCase().includes('db'))}.`);
                    }
                }

                return {
                    name: proj.name,
                    description: bullets.length >= 3 ? bullets.slice(0, 5).join('\n') : undefined,
                    technologies: techs,
                    url: proj.url,
                    githubUrl: proj.githubUrl,
                    startDate: formatDate(proj.startDate),
                    endDate: proj.isOngoing ? 'Present' : formatDate(proj.endDate)
                };
            })
            .filter((proj: any) => proj.name && proj.description && (proj.technologies?.length || 0) > 0),
        education: (user.profile?.education || [])
            .filter((edu: any) => edu.institution && edu.degree)
            .map((edu: any) => ({
                institution: edu.institution,
                degree: edu.degree,
                fieldOfStudy: edu.fieldOfStudy,
                startDate: formatDate(edu.startDate),
                endDate: edu.isCurrent ? 'Present' : formatDate(edu.endDate),
                grade: edu.grade
            })),
        certificates: (user.profile?.certificates || [])
            .filter((cert: any) => cert.name && cert.issuer)
            .map((cert: any) => ({
                name: cert.name,
                issuer: cert.issuer,
                date: cert.issueDate ? new Date(cert.issueDate).getFullYear().toString() : undefined
            })),
        achievements: (user.profile?.achievements || [])
            .filter((ach: any) => ach.title && ach.issuer)
            .map((ach: any) => ({
                title: ach.title,
                issuer: ach.issuer,
                date: ach.date ? formatDate(ach.date) : undefined,
                description: ach.description ? cleanDescription(ach.description) : undefined
            }))
    };

    // Remove empty optional sections
    if (resumeData.certificates?.length === 0) delete resumeData.certificates;
    if (resumeData.achievements?.length === 0) delete resumeData.achievements;

    return resumeData;
}
