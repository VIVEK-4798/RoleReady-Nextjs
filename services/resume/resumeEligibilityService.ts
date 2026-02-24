import User from '@/lib/models/User';
import Skill from '@/lib/models/Skill';
import UserSkill from '@/lib/models/UserSkill';
import connectDB from '@/lib/db/mongoose';
import { ResumeEligibility } from '@/types/resume';
import { Types } from 'mongoose';

/**
 * Hard Eligibility Rules for Resume Generation
 * 1. Contact Info: Full Name and Email
 * 2. Education: At least 1 entry with Degree and Institution
 * 3. Skills: Min 3 skills
 * 4. Experience/Projects: 1 experience OR 1 project (min 20 chars)
 */
export async function checkResumeEligibility(userId: string): Promise<ResumeEligibility> {
    await connectDB();

    const user = await User.findById(userId).lean();
    if (!user) {
        throw new Error('User not found');
    }

    const missingFields: string[] = [];
    const missingIds: string[] = [];
    const warnings: string[] = [];

    // 1) Contact Information (Name and Email required for blocker)
    const hasFullName = !!user.name;
    const hasEmail = !!user.email;
    const hasPhone = !!user.mobile;
    const hasLinkedIn = !!user.profile?.linkedinUrl || !!user.profile?.socialLinks?.linkedin;
    const hasGitHub = !!user.profile?.githubUrl || !!user.profile?.socialLinks?.github || !!user.githubUsername;

    if (!hasFullName || !hasEmail) {
        missingIds.push('contact');
        missingFields.push('Basic contact details (Name and Email)');
    }

    // Move Phone/LinkedIn to warnings
    if (!hasPhone) warnings.push('Add your mobile number to help recruiters reach you');
    if (!hasLinkedIn && !hasGitHub) warnings.push('Add LinkedIn or GitHub to increase credibility');

    // 2) Education
    const educationEntries = user.profile?.education || [];
    const hasValidEducation = educationEntries.some(edu =>
        edu.degree && edu.institution
    );

    if (educationEntries.length === 0 || !hasValidEducation) {
        missingIds.push('education');
        missingFields.push('At least 1 valid education entry (Degree and Institution)');
    } else {
        // Warning if dates are missing but education exists
        const hasDates = educationEntries.some(edu => edu.startDate || edu.endDate);
        if (!hasDates) {
            warnings.push('Add graduation dates to your education for a more professional resume');
        }
    }

    // 3) Skills
    const validSkills = await UserSkill.find({
        userId: new Types.ObjectId(userId),
        level: { $nin: ['none'] },
        validationStatus: { $ne: 'rejected' }
    }).lean();

    const skillsCount = validSkills.length;
    if (skillsCount < 3) {
        missingIds.push('skills');
        missingFields.push('At least 3 technical skills');
    }

    // 4) Experience OR Projects
    const MIN_DESC_LENGTH = 20;
    const experienceEntries = user.profile?.experience || [];
    const hasValidExperience = experienceEntries.some(exp =>
        exp.title && exp.company && (exp.description?.trim().length || 0) >= MIN_DESC_LENGTH
    );

    const projectEntries = user.profile?.projects || [];
    const validProjects = projectEntries.filter(proj =>
        proj.name &&
        (proj.description?.trim().length || 0) >= MIN_DESC_LENGTH
    );

    const hasExperienceOption = experienceEntries.length >= 1 && hasValidExperience;
    const hasProjectOption = validProjects.length >= 1;

    if (!hasExperienceOption && !hasProjectOption) {
        missingIds.push('experience');
        missingFields.push('1 experience OR 1 project (min 20 chars description)');
    }

    // SOFT WARNINGS (Professional Optimization)
    const aboutText = user.profile?.about || user.profile?.bio || '';
    if (aboutText.length < 80) {
        warnings.push('Add a detailed professional summary (About) to unlock optimal resume enrichment');
    }
    if (!user.profile?.certificates || user.profile.certificates.filter(c => c.name && c.issuer).length === 0) {
        warnings.push('Include professional certificates for a perfect, industry-validated resume');
    }
    if (!user.profile?.achievements || user.profile.achievements.filter(a => a.title && a.issuer).length === 0) {
        warnings.push('Add achievements or awards to make your resume stand out to elite recruiters');
    }

    return {
        eligible: missingIds.length === 0,
        missingFields,
        missingIds,
        warnings
    };
}
