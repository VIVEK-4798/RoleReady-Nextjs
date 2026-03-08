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
 * Group skills by category with expansion and enrichment
 */
function groupSkills(skills: { name: string, level: string }[]): Record<string, string[]> {
    const groups: Record<string, string[]> = {};
    const skillNamesLower = new Set(skills.map(s => s.name.toLowerCase()));

    // Expansion Rules Map
    const expansionMap: Record<string, string> = {
        'html': 'HTML5',
        'css': 'CSS3',
        'javascript': 'JavaScript (ES6+)',
        'react': 'React.js',
        'express': 'Express.js',
        'nextjs': 'Next.js',
        'next.js': 'Next.js',
        'mongodb': 'MongoDB (NoSQL)',
        'sql': 'SQL (Relational Databases)',
        'postgresql': 'PostgreSQL',
        'mysql': 'MySQL'
    };

    skills.forEach(skill => {
        let categorized = false;
        let finalName = skill.name;
        const lowName = skill.name.toLowerCase();

        // Apply Expansion
        if (expansionMap[lowName]) {
            finalName = expansionMap[lowName];
        }

        for (const [category, keywords] of Object.entries(SKILL_CATEGORIES)) {
            if (keywords.some(k => lowName.includes(k))) {
                if (!groups[category]) groups[category] = [];
                if (!groups[category].includes(finalName)) {
                    groups[category].push(finalName);
                }
                categorized = true;
                break;
            }
        }

        if (!categorized) {
            const miscKey = 'Tools & Technologies';
            if (!groups[miscKey]) groups[miscKey] = [];
            if (!groups[miscKey].includes(finalName)) {
                groups[miscKey].push(finalName);
            }
        }
    });

    // Enrichment Logic (Rule-based phrases)
    if (groups['Backend']) {
        const hasNode = skillNamesLower.has('node.js') || skillNamesLower.has('nodejs');
        const hasExpress = skillNamesLower.has('express') || skillNamesLower.has('express.js');
        if (hasNode && hasExpress && !groups['Backend'].includes('REST API Development')) {
            groups['Backend'].push('REST API Development');
        }
    }

    if (groups['Database']) {
        if (!groups['Database'].includes('Database Design')) {
            groups['Database'].push('Database Design');
        }
    }

    return groups;
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
 * Robust validation to detect and filter out "junk" or placeholder content.
 * Filters common dummy inputs like 'q', '-', 'test', 'NA', etc.
 */
function isValidContent(text: string | undefined): boolean {
    if (!text || typeof text !== 'string') return false;
    const trimmed = text.trim();
    if (trimmed.length < 2) return false;

    const lower = trimmed.toLowerCase();
    const placeholders = ['placeholder', 'test', 'n/a', 'na', 'none', 'dummy', 'todo', 'null', 'undefined', '---', '...', '--- ---'];
    if (placeholders.some(p => lower === p)) return false;

    // Pattern: single character repeated (e.g., 'qqq', '...')
    if (/^(.)\1+$/.test(trimmed) && trimmed.length < 5) return false;

    return true;
}

export async function buildResumeData(userId: string): Promise<ResumeData> {
    await connectDB();

    const user = await User.findById(userId).lean();

    if (!user) {
        throw new Error('User not found');
    }

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
        .filter(s => s.name !== 'Unknown Skill' && isValidContent(s.name))
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

    // Summary Enrichment Engine
    let userAbout = user.profile?.about || user.profile?.bio || '';
    let summary = cleanDescription(userAbout);
    const isAutoSummary = !isValidContent(summary) || summary.length < 120;

    if (isAutoSummary && skillNames.length >= 2) {
        const lowSkills = skillNames.map(s => s.toLowerCase());
        const hasSkill = (s: string) => lowSkills.some(k => k.includes(s));

        // Build architecture phrases
        const coreSkills = skillNames.slice(0, 4).map(s => {
            if (s.toLowerCase() === 'react') return 'React.js';
            if (s.toLowerCase() === 'next.js' || s.toLowerCase() === 'nextjs') return 'Next.js';
            return s;
        }).join(', ');

        let contextualPhrases = '';
        if (hasSkill('react')) contextualPhrases += ' proficient in component-based UI development,';
        if (hasSkill('next.js') || hasSkill('nextjs')) contextualPhrases += ' SSR and performance optimization,';
        if (hasSkill('node') || hasSkill('express')) contextualPhrases += ' developing RESTful APIs,';
        if (hasSkill('sql') || hasSkill('mongodb')) contextualPhrases += ' and database design and management.';

        const rolePart = finalRoleHeadline.toLowerCase().includes('developer') ? finalRoleHeadline : `${finalRoleHeadline} Developer`;

        summary = `${rolePart} experienced in building scalable applications using ${coreSkills}. Focused on${contextualPhrases || ' modern web architectures and delivering high-quality, maintainable software solutions.'}`;

        // Final cleanup of the generated summary
        summary = summary.replace(/,\s+\./g, '.').replace(/,\s+and/g, ' and').trim();
    } else if (targetRoleName && summary.toLowerCase().includes('full stack developer') && targetRoleName !== 'Full Stack Developer') {
        summary = summary.replace(/full\s+stack\s+developer/gi, targetRoleName);
    }

    const resumeData: ResumeData = {
        contact: {
            fullName: user.name,
            email: user.email,
            phone: user.mobile,
            linkedin: user.profile?.linkedinUrl || user.profile?.socialLinks?.linkedin,
            github: user.profile?.githubUrl || user.profile?.socialLinks?.github || (user.githubUsername ? `https://github.com/${user.githubUsername}` : undefined),
            location: user.profile?.location,
            headline: finalRoleHeadline
        },
        summary: summary.length >= 25 ? summary : undefined,
        skills,
        groupedSkills,
        experience: (user.profile?.experience || [])
            .filter((exp: any) => isValidContent(exp.title) && isValidContent(exp.company))
            .map((exp: any) => {
                const bullets = formatToBullets(exp.description || '');
                return {
                    title: exp.title,
                    company: exp.company,
                    location: exp.location,
                    startDate: formatDate(exp.startDate),
                    endDate: exp.isCurrent ? 'Present' : formatDate(exp.endDate),
                    isCurrent: exp.isCurrent,
                    description: bullets.length >= 1 ? bullets.slice(0, 5).join('\n') : undefined
                };
            })
            .filter((exp: any) => exp.description),
        projects: (user.profile?.projects || [])
            .map((proj: any) => {
                const originalDescription = proj.description || '';
                let bullets = formatToBullets(originalDescription);
                const projectTechs = (proj.technologies || []) as string[];
                const userSkillNames = new Set(skills.map(s => s.name.toLowerCase()));
                const projectTechSet = new Set(projectTechs.map(t => t.toLowerCase()));

                // Detection: Is the description weak, too short, or placeholder?
                const isWeak =
                    bullets.length < 3 ||
                    originalDescription.length < 80 ||
                    !isValidContent(originalDescription) ||
                    /placeholder|built\s+using|project\s+built|basic\s+project/i.test(originalDescription);

                // If weak, we trigger the Contextual Enhancement Engine
                if (isWeak) {
                    const enhancedBullets: string[] = [];

                    // Priority 1: Use technologies specifically listed for this project
                    // Priority 2: Use user's overall skill set if project tech is sparse
                    const hasTech = (t: string) => projectTechSet.has(t) || userSkillNames.has(t);

                    // Rule 1: Frontend (React / Next.js)
                    if (hasTech('react') || hasTech('next.js') || hasTech('nextjs')) {
                        enhancedBullets.push('Developed responsive user interfaces using React.js and modern JavaScript patterns.');
                    }

                    // Rule 2: Backend (Node.js / Express)
                    if (hasTech('node.js') || hasTech('nodejs') || hasTech('express.js') || hasTech('express')) {
                        enhancedBullets.push('Built RESTful APIs and server-side logic using Node.js and Express.js for seamless data flow.');
                    }

                    // Rule 3: Database (SQL / MongoDB)
                    const hasSQL = hasTech('sql') || hasTech('postgresql') || hasTech('mysql');
                    const hasMongo = hasTech('mongodb') || hasTech('mongoose');
                    if (hasSQL || hasMongo) {
                        const dbTech = hasSQL ? 'SQL' : 'MongoDB';
                        enhancedBullets.push(`Designed and managed complex database operations and schema structures using ${dbTech}.`);
                    }

                    // Rule 4: Integrations (Auth / Payments / Cloud)
                    const hasIntegrations = projectTechs.some(t => {
                        const low = t.toLowerCase();
                        return low.includes('auth') || low.includes('stripe') || low.includes('razorpay') ||
                            low.includes('firebase') || low.includes('api') || low.includes('cloud');
                    }) || userSkillNames.has('auth') || userSkillNames.has('firebase');

                    if (hasIntegrations) {
                        enhancedBullets.push('Integrated third-party services and secure backend functionality to enhance application features.');
                    }

                    // Rule 5: Full Stack indicator
                    const isFullStack =
                        (hasTech('react') || hasTech('next.js')) &&
                        (hasTech('node.js') || hasTech('python') || hasTech('java') || hasTech('backend'));

                    if (isFullStack && enhancedBullets.length < 4) {
                        enhancedBullets.push('Implemented full-stack architecture connecting frontend and backend systems for optimal performance.');
                    }

                    // Fallback: If still under 3 bullets, add a general professional one if we have ANY tech
                    if (enhancedBullets.length < 3 && projectTechs.length > 0) {
                        const topTechs = projectTechs.slice(0, 2).join(' and ');
                        enhancedBullets.push(`Architected and engineered core features utilizing ${topTechs} to deliver robust software solutions.`);
                    }

                    // Merge and cleanup
                    if (bullets.length <= 1 || bullets.some(b => !isValidContent(b) || b.length < 20)) {
                        bullets = enhancedBullets;
                    } else {
                        // Blend: Add unique enhanced bullets to existing ones
                        enhancedBullets.forEach(eb => {
                            if (bullets.length < 4 && !bullets.some(b => b.substring(0, 15) === eb.substring(0, 15))) {
                                bullets.push(eb);
                            }
                        });
                    }
                }

                // Final safety: Cap at 4 bullets
                const finalBullets = bullets.filter(b => isValidContent(b)).slice(0, 4);

                return {
                    name: proj.name,
                    description: finalBullets.length >= 1 ? finalBullets.join('\n') : undefined,
                    technologies: projectTechs,
                    url: proj.url,
                    githubUrl: proj.githubUrl,
                    startDate: formatDate(proj.startDate),
                    endDate: proj.isOngoing ? 'Present' : formatDate(proj.endDate)
                };
            })
            .filter((proj: any) => isValidContent(proj.name) && proj.description),
        education: (user.profile?.education || [])
            .filter((edu: any) => isValidContent(edu.institution) && isValidContent(edu.degree))
            .map((edu: any) => ({
                institution: edu.institution.trim(),
                degree: edu.degree.trim(),
                fieldOfStudy: edu.fieldOfStudy,
                startDate: formatDate(edu.startDate),
                endDate: edu.isCurrent ? 'Present' : formatDate(edu.endDate),
                grade: edu.grade
            })),
        certificates: (user.profile?.certificates || [])
            .filter((cert: any) => isValidContent(cert.name) && isValidContent(cert.issuer))
            .map((cert: any) => ({
                name: cert.name.trim(),
                issuer: cert.issuer.trim(),
                date: cert.issueDate ? new Date(cert.issueDate).getFullYear().toString() : undefined
            })),
        achievements: (user.profile?.achievements || [])
            .filter((ach: any) => isValidContent(ach.title))
            .map((ach: any) => ({
                title: ach.title.trim(),
                issuer: ach.issuer || 'Professional Achievement',
                date: ach.date ? formatDate(ach.date) : (ach.issueDate ? formatDate(ach.issueDate) : undefined),
                description: isValidContent(ach.description) ? cleanDescription(ach.description!) : undefined
            }))
    };

    // Final Cleanup: Remove empty sections entirely
    if (resumeData.education && resumeData.education.length === 0) delete (resumeData as any).education;
    if (resumeData.experience && resumeData.experience.length === 0) delete (resumeData as any).experience;
    if (resumeData.projects && resumeData.projects.length === 0) delete (resumeData as any).projects;
    if (resumeData.certificates && resumeData.certificates.length === 0) delete (resumeData as any).certificates;
    if (resumeData.achievements && resumeData.achievements.length === 0) delete (resumeData as any).achievements;

    return resumeData;
}
