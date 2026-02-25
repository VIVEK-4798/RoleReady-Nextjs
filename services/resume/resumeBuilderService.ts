import * as mongoose from 'mongoose';
import Skill from '@/lib/models/Skill';
import User from '@/lib/models/User';
import UserSkill from '@/lib/models/UserSkill';
import Role from '@/lib/models/Role';
import TargetRole from '@/lib/models/TargetRole';
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
 * Extremely robust text cleaning and deduplication for resume formatting.
 * Removes unprofessional phrases, fixes spacing, and deduplicates sentences.
 */
function cleanDescription(text: string): string {
    if (!text) return '';

    // 1. Fix missing space after periods, questions, and exclamation marks
    let cleaned = text.replace(/([.!?])(?=[A-Z])/g, '$1 ');

    // 2. Remove known unprofessional or repeating filler phrases
    const fillerPhrases = [
        /you\s+are\s+made\s+for\s+the\s+best\.?/gi,
        /placeholder\s+text\.?/gi,
        /test\s+description\.?/gi,
        /add\s+more\s+information\.?/gi,
        /lorem\s+ipsum.*?\.?/gi
    ];
    fillerPhrases.forEach(regex => {
        cleaned = cleaned.replace(regex, '');
    });

    // 3. Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // 4. Sentence-based deduplication
    const sentences = cleaned.split(/(?<=[.!?])\s+(?=[A-Z])/);

    const uniqueSentences: string[] = [];
    const seen = new Set<string>();

    sentences.forEach(s => {
        const trimmed = s.trim();
        if (!trimmed || trimmed.length < 4) return;

        const normalized = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!seen.has(normalized)) {
            uniqueSentences.push(trimmed);
            seen.add(normalized);
        }
    });

    return uniqueSentences.join(' ');
}

/**
 * Transforms long text into professional bullet points for resumes
 */
function formatToBullets(text: string): string[] {
    const cleaned = cleanDescription(text);
    if (!cleaned) return [];

    const bulletCandidates = cleaned.split(/(?<=[.!?])\s+(?=[A-Z])|(?<=\.)/);

    const actionVerbsMap: Record<string, string> = {
        'i build': 'Developed',
        'i built': 'Developed',
        'i make': 'Created',
        'i created': 'Architected',
        'built': 'Architected',
        'made': 'Engineered',
        'managed': 'Orchestrated',
        'worked': 'Collaborated',
        'helped': 'Facilitated'
    };

    return bulletCandidates
        .map(s => {
            let sentence = s.trim();
            if (!sentence) return '';

            sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
            Object.entries(actionVerbsMap).forEach(([bad, good]) => {
                const regex = new RegExp(`^${bad}`, 'i');
                if (regex.test(sentence)) {
                    sentence = sentence.replace(regex, good);
                }
            });

            if (sentence.endsWith('.')) sentence = sentence.slice(0, -1);
            return sentence;
        })
        .filter(s => s.length > 5);
}

/**
 * Infer professional role from skills
 */
function inferRole(skillNames: string[]): string {
    const lowSkills = skillNames.map(s => s.toLowerCase());
    const hasFrontend = lowSkills.some(s => SKILL_CATEGORIES['Frontend']?.some(k => s.includes(k)));
    const hasBackend = lowSkills.some(s => SKILL_CATEGORIES['Backend']?.some(k => s.includes(k)));

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
            const miscKey = 'Tools & Technologies';
            if (!groups[miscKey]) groups[miscKey] = [];
            groups[miscKey].push(skill.name);
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

    console.log('🔍 DEBUG: User ID:', userId);
    console.log('🔍 DEBUG: Profile object:', JSON.stringify(user.profile, null, 2));

    // CRITICAL: Fetch active target role from TargetRole model (source of truth)
    // We use a direct query to be 100% sure and handle potential population issues
    const activeTargetRole = await mongoose.model('TargetRole').findOne({
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true
    }).populate({ path: 'roleId', model: Role }).lean() as any;

    const targetRoleName = (activeTargetRole?.roleId as any)?.name;

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
        .filter(s => s.name !== 'Unknown Skill')
        .sort((a, b) => LEVEL_ORDER[b.level] - LEVEL_ORDER[a.level]);

    const skillNames = skills.map(s => s.name);
    const inferredRole = inferRole(skillNames);

    // DECISION: Target Role > Profile Headline > Inferred Role
    // But we prioritize Target Role so much that we'll use it to override stagnant headlines
    let finalRoleHeadline = targetRoleName || user.profile?.headline || inferredRole;

    // If the user has a target role, and the current headline is just a generic fallback, override it
    if (targetRoleName && (!user.profile?.headline || user.profile.headline === 'Full Stack Developer' || user.profile.headline === 'Software Developer')) {
        finalRoleHeadline = targetRoleName;
    }

    const groupedSkills = groupSkills(skills);

    const formatDate = (date?: Date | string) => {
        if (!date) return 'Present';
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return 'Present';
            return format(d, 'MMM yyyy');
        } catch (e) {
            return 'Present';
        }
    };

    // Summary Enrichment & Compression (Max ~3 lines / 280 chars)
    let userAbout = user.profile?.about || user.profile?.bio || '';
    let summary = cleanDescription(userAbout);

    // If summary is auto-generated or too short, or contains the wrong role, we rebuild/enrich it
    const isAutoSummary = summary.length < 50 || summary.toLowerCase().includes('placeholder');

    if (isAutoSummary && skillNames.length >= 2) {
        const topSkillsGroup = skillNames.slice(0, 5).join(', ');
        summary = `${finalRoleHeadline} with a strong foundation in ${topSkillsGroup}. Dedicated to building efficient, scalable applications and solving complex technical challenges with modern development practices.`;
    } else if (targetRoleName && summary.toLowerCase().includes('full stack developer') && targetRoleName !== 'Full Stack Developer') {
        summary = summary.replace(/full\s+stack\s+developer/gi, targetRoleName);
    }

    // Hard limit summary length for one-page fit (approx 3 lines)
    if (summary.length > 280) {
        summary = summary.substring(0, 277) + '...';
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
            headline: finalRoleHeadline
        },
        summary: summary.length >= 25 ? summary : undefined,
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
                    // COMPRESSION: Limit to 3 bullets
                    description: bullets.length >= 1 ? bullets.slice(0, 3).join('\n') : undefined
                };
            })
            .filter((exp: any) => exp.title && exp.company && exp.description),
        projects: (user.profile?.projects || [])
            .map((proj: any) => {
                let bullets = formatToBullets(proj.description || '');
                const techs = proj.technologies || [];

                if (bullets.length < 2 && techs.length > 0) {
                    const lowTechs = techs.map((t: string) => t.toLowerCase());
                    if (lowTechs.some((t: string) => t.includes('react') || t.includes('next'))) {
                        bullets.push(`Developed a responsive and dynamic user interface using ${techs.find((t: string) => t.toLowerCase().includes('react') || t.toLowerCase().includes('next'))}`);
                    }
                    if (lowTechs.some((t: string) => t.includes('node') || t.includes('express'))) {
                        bullets.push(`Built and maintained robust server-side logic and RESTful APIs with ${techs.find((t: string) => t.toLowerCase().includes('node') || t.toLowerCase().includes('express'))}`);
                    }
                    if (lowTechs.some((t: string) => t.includes('razorpay') || t.includes('stripe'))) {
                        bullets.push(`Integrated secure and reliable payment processing workflows using ${techs.find((t: string) => t.toLowerCase().includes('razorpay') || t.toLowerCase().includes('stripe'))}`);
                    }
                    if (lowTechs.some((t: string) => t.includes('mongo') || t.includes('sql') || t.includes('db'))) {
                        bullets.push(`Managed data persistence and optimized database queries using ${techs.find((t: string) => t.toLowerCase().includes('mongo') || t.toLowerCase().includes('sql') || t.toLowerCase().includes('db'))}`);
                    }
                }

                return {
                    name: proj.name,
                    // COMPRESSION: Limit to 3 bullets
                    description: bullets.length >= 1 ? bullets.slice(0, 3).join('\n') : undefined,
                    technologies: techs,
                    url: proj.url,
                    githubUrl: proj.githubUrl,
                    startDate: formatDate(proj.startDate),
                    endDate: proj.isOngoing ? 'Present' : formatDate(proj.endDate)
                };
            })
            .filter((proj: any) => proj.name && proj.description),
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
            .filter((cert: any) => cert.name)
            .map((cert: any) => ({
                name: cert.name,
                issuer: cert.issuer || 'Professional Certification',
                date: cert.issueDate ? new Date(cert.issueDate).getFullYear().toString() : undefined
            })),
        achievements: (user.profile?.achievements || [])
            .filter((ach: any) => ach.title)
            .map((ach: any) => ({
                title: ach.title,
                issuer: ach.issuer || 'Achievement Recognition',
                date: ach.date ? formatDate(ach.date) : (ach.issueDate ? formatDate(ach.issueDate) : undefined),
                description: ach.description ? cleanDescription(ach.description) : undefined
            }))
    };

    // SMART MERGE: If either certificates or achievements has only 1-2 items, they can be merged in the UI
    // But we keep them separate in resumeData to allow the UI/PDF component to decide layout.
    // However, if we want to force it globally:
    const certCount = resumeData.certificates?.length || 0;
    const achCount = resumeData.achievements?.length || 0;

    // Use a flag for the UI to know it should merge
    (resumeData as any).shouldMergeSmallSections = (certCount > 0 && certCount <= 2) || (achCount > 0 && achCount <= 2);

    // Cleanup empty sections
    if (resumeData.certificates && resumeData.certificates.length === 0) delete resumeData.certificates;
    if (resumeData.achievements && resumeData.achievements.length === 0) delete resumeData.achievements;

    return resumeData;
}
