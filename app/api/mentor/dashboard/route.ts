/**
 * Mentor Dashboard Data API
 * 
 * GET /api/mentor/dashboard
 * 
 * Returns consolidated data for the mentor dashboard:
 * - Stats (pending, total, validated today, students)
 * - Recent Activity (latest validations)
 * - Pending Tasks (top pending skill requests)
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { UserSkill, Internship, Job, User } from '@/lib/models';
import { successResponse, errors } from '@/lib/utils/api';
import { requireMentorApi } from '@/lib/auth/utils';
import { Types } from 'mongoose';
import { getMentorValidationStats } from '@/lib/services/mentorQueueService';

export async function GET(request: NextRequest) {
    try {
        const { user, error } = await requireMentorApi();
        if (error) return error;
        if (!user?.id) return errors.unauthorized('Authentication required');

        await connectDB();
        const mentorId = new Types.ObjectId(user.id);

        // 1. Get Core Stats
        const stats = await getMentorValidationStats(user.id);

        // 2. Get Validated Today Count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const validatedToday = await UserSkill.countDocuments({
            validatedBy: mentorId,
            validatedAt: { $gte: today }
        });

        // 3. Get Active Internships & Jobs posted by this mentor
        const [internshipsCount, jobsCount] = await Promise.all([
            Internship.countDocuments({ createdBy: mentorId, isActive: true }),
            Job.countDocuments({ createdBy: mentorId, isActive: true })
        ]);

        // 4. Get Recent Activity (History)
        const recentSkills = await UserSkill.find({
            validatedBy: mentorId,
            validationStatus: { $in: ['validated', 'rejected'] }
        })
            .populate('userId', 'name')
            .populate('skillId', 'name')
            .sort({ validatedAt: -1 })
            .limit(5)
            .lean();

        const recentActivity = recentSkills.map((s: any) => ({
            id: s._id.toString(),
            studentName: s.userId?.name || 'Unknown Student',
            skill: s.skillId?.name || 'Unknown Skill',
            action: s.validationStatus as 'validated' | 'rejected',
            time: formatRelativeTime(s.validatedAt)
        }));

        // 5. Get Pending Tasks (Top 3 oldest pending)
        // First get assigned users
        const assignedUsers = await User.find({ mentorId }).select('_id').lean();
        const assignedUserIds = assignedUsers.map(u => u._id);

        const pendingSkills = await UserSkill.find({
            userId: { $in: assignedUserIds },
            validationStatus: 'pending'
        })
            .populate('userId', 'name')
            .populate('skillId', 'name')
            .sort({ createdAt: 1 })
            .limit(3)
            .lean();

        const pendingTasks = pendingSkills.map((s: any) => ({
            id: s._id.toString(),
            title: `Review ${s.skillId?.name || 'Skill'}`,
            student: s.userId?.name || 'Unknown',
            time: formatDueTime(s.createdAt)
        }));

        // 6. Calculate Performance Metrics
        const allProcessedSkills = await UserSkill.find({
            validatedBy: mentorId,
            validationStatus: { $in: ['validated', 'rejected'] },
            validatedAt: { $exists: true }
        }).select('createdAt validatedAt').lean();

        let avgResponseTime = '0h';
        if (allProcessedSkills.length > 0) {
            const totalDiff = allProcessedSkills.reduce((acc, s) => {
                const diff = new Date(s.validatedAt!).getTime() - new Date(s.createdAt!).getTime();
                return acc + diff;
            }, 0);
            const avgMs = totalDiff / allProcessedSkills.length;
            const hours = (avgMs / 3600000).toFixed(1);
            avgResponseTime = `${hours}h`;
        }

        // Mock satisfaction for now (can be expanded later)
        const satisfaction = allProcessedSkills.length > 0 ? (4.5 + Math.random() * 0.4).toFixed(1) : '5.0';

        // 7. Calculate Completion Rate
        const totalProcessed = stats.total;
        const totalRequests = totalProcessed + stats.pending;
        const completionRate = totalRequests > 0
            ? Math.round((totalProcessed / totalRequests) * 100)
            : 100;

        return successResponse({
            stats: {
                pendingValidations: stats.pending,
                validatedToday,
                totalValidations: stats.total,
                internshipsCount,
                jobsCount,
                activeStudents: stats.assignedStudents,
                completionRate,
                avgResponseTime,
                satisfaction
            },
            recentActivity,
            pendingTasks
        });

    } catch (error) {
        console.error('GET /api/mentor/dashboard error:', error);
        return errors.serverError('Failed to fetch dashboard data');
    }
}

function formatRelativeTime(date: Date) {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

function formatDueTime(createdAtDate: Date) {
    const diff = Date.now() - new Date(createdAtDate).getTime();
    const hours = Math.floor(diff / 3600000);

    if (hours < 24) return 'Due today';
    if (hours < 48) return 'Due tomorrow';
    return `In ${Math.floor(hours / 24)} days`;
}
