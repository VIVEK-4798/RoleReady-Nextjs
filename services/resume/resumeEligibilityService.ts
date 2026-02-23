import User from '@/lib/models/User';
import UserSkill from '@/lib/models/UserSkill';
import connectDB from '@/lib/db/mongoose';
import { ResumeEligibility } from '@/types/resume';
import { Types } from 'mongoose';

/**
 * Hard Eligibility Rules for Resume Generation
 * 1. Contact Info: Full Name, Email, Phone, and (LinkedIn OR GitHub)
 * 2. Education: At least 1 entry with Degree, Institution, and Year
 * 3. Skills: Min 5 skills, at least 2 at Intermediate or higher
 * 4. Experience/Projects: 1 detailed experience (80+ chars) OR 2 detailed projects (80+ chars each + tech stack)
 */
export async function checkResumeEligibility(userId: string): Promise<ResumeEligibility> {
    await connectDB();

    const user = await User.findById(userId).lean();
    if (!user) {
        throw new Error('User not found');
    }

    const missingFields: string[] = [];
    const warnings: string[] = [];

    // 1) Contact Information
    const hasFullName = !!user.name;
    const hasEmail = !!user.email;
    const hasPhone = !!user.mobile;
    const hasLinkedIn = !!user.profile?.linkedinUrl;
    const hasGitHub = !!user.profile?.githubUrl || !!user.githubUsername;

    if (!hasFullName || !hasEmail || !hasPhone || (!hasLinkedIn && !hasGitHub)) {
        missingFields.push('Full contact details (Name, Email, Phone, and LinkedIn/GitHub)');
    }

    // 2) Education
    const educationEntries = user.profile?.education || [];
    const hasValidEducation = educationEntries.some(edu =>
        edu.degree && edu.institution && (edu.startDate || edu.endDate)
    );

    if (educationEntries.length === 0 || !hasValidEducation) {
        missingFields.push('At least 1 valid education entry (Degree, Institution, and Year)');
    }

    // 3) Skills
    const validSkills = await UserSkill.find({
        userId: new Types.ObjectId(userId),
        level: { $nin: ['none'] },
        validationStatus: { $ne: 'rejected' }
    }).lean();

    const skillsCount = validSkills.length;
    const intermediatePlusCount = validSkills.filter(s =>
        ['intermediate', 'advanced', 'expert'].includes(s.level)
    ).length;

    if (skillsCount < 5 || intermediatePlusCount < 2) {
        missingFields.push('At least 5 skills (with minimum 2 at Intermediate level or higher)');
    }

    // 4) Experience OR Projects
    const experienceEntries = user.profile?.experience || [];
    const hasValidExperience = experienceEntries.some(exp =>
        exp.title && exp.company && (exp.description?.trim().length || 0) >= 80
    );

    const projectEntries = user.profile?.projects || [];
    const validProjects = projectEntries.filter(proj =>
        proj.name &&
        (proj.description?.trim().length || 0) >= 80 &&
        (proj.technologies?.length || 0) > 0
    );

    const hasExperienceOption = experienceEntries.length >= 1 && hasValidExperience;
    const hasProjectOption = validProjects.length >= 2;

    if (!hasExperienceOption && !hasProjectOption) {
        missingFields.push('1 detailed work experience (80+ chars) OR 2 detailed projects (80+ chars each)');
    }

    // SOFT WARNINGS (Do not block)
    if (!user.profile?.about && !user.profile?.bio) {
        warnings.push('Add a professional summary (Bio) to improve ATS ranking');
    }
    if (!user.profile?.certificates || user.profile.certificates.length === 0) {
        warnings.push('Consider adding certificates to showcase your certifications');
    }
    if (!user.profile?.achievements || user.profile.achievements.length === 0) {
        warnings.push('Adding achievements can help you stand out from other candidates');
    }

    return {
        eligible: missingFields.length === 0,
        missingFields,
        warnings
    };
}
