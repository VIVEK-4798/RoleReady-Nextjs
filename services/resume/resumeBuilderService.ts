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
    }).populate('skillId').lean();

    const skills = userSkillsRaw
        .map((us: any) => ({
            name: us.skillId?.name || 'Unknown Skill',
            level: us.level as SkillLevel
        }))
        .sort((a, b) => LEVEL_ORDER[b.level] - LEVEL_ORDER[a.level]);

    const formatDate = (date?: Date | string) => {
        if (!date) return '';
        try {
            return format(new Date(date), 'MMM yyyy');
        } catch (e) {
            return '';
        }
    };

    const resumeData: ResumeData = {
        contact: {
            fullName: user.name,
            email: user.email,
            phone: user.mobile,
            linkedin: user.profile?.linkedinUrl,
            github: user.profile?.githubUrl || (user.githubUsername ? `https://github.com/${user.githubUsername}` : undefined),
            location: user.profile?.location
        },
        summary: user.profile?.about,
        skills,
        experience: (user.profile?.experience || [])
            .filter((exp: any) => exp.title && exp.company && (exp.description?.trim().length || 0) >= 80)
            .map((exp: any) => ({
                title: exp.title,
                company: exp.company,
                location: exp.location,
                startDate: formatDate(exp.startDate),
                endDate: exp.isCurrent ? 'Present' : formatDate(exp.endDate),
                isCurrent: exp.isCurrent,
                description: exp.description
            })),
        projects: (user.profile?.projects || [])
            .filter((proj: any) => proj.name && (proj.description?.trim().length || 0) >= 80 && (proj.technologies?.length || 0) > 0)
            .map((proj: any) => ({
                name: proj.name,
                description: proj.description,
                technologies: proj.technologies || [],
                url: proj.url,
                githubUrl: proj.githubUrl,
                startDate: formatDate(proj.startDate),
                endDate: proj.isOngoing ? 'Present' : formatDate(proj.endDate)
            })),
        education: (user.profile?.education || [])
            .filter((edu: any) => edu.institution && edu.degree)
            .map((edu: any) => ({
                institution: edu.institution,
                degree: edu.degree,
                fieldOfStudy: edu.fieldOfStudy,
                startDate: formatDate(edu.startDate),
                endDate: edu.isCurrent ? 'Present' : formatDate(edu.endDate),
                grade: edu.grade
            }))
    };

    return resumeData;
}
