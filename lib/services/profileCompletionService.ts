import User from '@/lib/models/User';
import UserSkill from '@/lib/models/UserSkill';
import { Resume } from '@/lib/models/Resume';
import connectDB from '@/lib/db/mongoose';
import { Types } from 'mongoose';

/**
 * Service to calculate profile completion percentage.
 * Server-side source of truth for completion progress.
 */
export async function calculateProfileCompletion(userId: string) {
    await connectDB();

    const user = await User.findById(userId).lean();
    if (!user) {
        throw new Error('User not found');
    }

    let filled = 0;
    const total = 12; // 9 base sections + 3 social links

    // 1) Name
    if (user.name) filled++;

    // 2) Email
    if (user.email) filled++;

    // 3) Bio/About
    if (user.profile?.bio?.trim() || user.profile?.about?.trim()) filled++;

    // 4) Skills (at least one)
    const skillsCount = await UserSkill.countDocuments({
        userId: new Types.ObjectId(userId),
        level: { $ne: 'none' }
    });
    if (skillsCount > 0) filled++;

    // 5) Experience
    if (user.profile?.experience && user.profile.experience.length > 0) filled++;

    // 6) Education
    if (user.profile?.education && user.profile.education.length > 0) filled++;

    // 7) Resume (Uploaded OR Generated)
    const hasUploadedResume = !!(user.profile?.resume?.fileUrl);
    const hasGeneratedResume = !!(user.profile?.hasGeneratedResume);

    // Check Resume collection for active resumes as a fallback for uploaded
    const activeResume = await Resume.findOne({ userId: new Types.ObjectId(userId), isActive: true });

    if (hasUploadedResume || hasGeneratedResume || activeResume) {
        filled++;
    }

    // 8) Certificates
    if (user.profile?.certificates && user.profile.certificates.length > 0) filled++;

    // 9) Projects
    if (user.profile?.projects && user.profile.projects.length > 0) filled++;

    // Social Links (LinkedIn, GitHub, Twitter)
    const links = user.profile?.socialLinks;
    if (links?.linkedin?.startsWith('https://')) filled++;
    if (links?.github?.startsWith('https://')) filled++;
    if (links?.twitter?.startsWith('https://')) filled++;

    const percentage = Math.round((filled / total) * 100);

    return {
        percentage,
        filled,
        total,
        breakdown: {
            name: !!user.name,
            email: !!user.email,
            bio: !!(user.profile?.bio?.trim() || user.profile?.about?.trim()),
            skills: skillsCount > 0,
            experience: !!(user.profile?.experience && user.profile.experience.length > 0),
            education: !!(user.profile?.education && user.profile.education.length > 0),
            resume: !!(hasUploadedResume || hasGeneratedResume || activeResume),
            certificates: !!(user.profile?.certificates && user.profile.certificates.length > 0),
            projects: !!(user.profile?.projects && user.profile.projects.length > 0),
            socialLinks: {
                linkedin: !!links?.linkedin?.startsWith('https://'),
                github: !!links?.github?.startsWith('https://'),
                twitter: !!links?.twitter?.startsWith('https://'),
            }
        }
    };
}
