/**
 * Admin API: Get Mentor Workload Statistics
 * 
 * GET /api/admin/mentor-workload
 * 
 * AUTHORIZATION: Admin only
 * 
 * RETURNS: Array of all mentors with their workload statistics
 * - assignedUsersCount: Number of users assigned to each mentor
 * - pendingValidationsCount: Number of pending validations from assigned users
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import UserSkill from '@/lib/models/UserSkill';
import type { MentorWorkload } from '@/types/mentor';

export async function GET(request: NextRequest) {
    try {
        // Verify admin authentication
        const currentUser = await getCurrentUser();

        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Admin access required.' },
                { status: 403 }
            );
        }

        await dbConnect();

        // Get all mentors
        const mentors = await User.find({
            role: 'mentor',
        })
            .select('_id name email isActive')
            .lean();

        // Calculate workload for each mentor
        const workloadPromises = mentors.map(async (mentor) => {
            // Count assigned users
            const assignedUsersCount = await User.countDocuments({
                mentorId: mentor._id,
                role: 'user',
                isActive: true,
            });

            // Get assigned user IDs
            const assignedUsers = await User.find({
                mentorId: mentor._id,
                role: 'user',
                isActive: true,
            })
                .select('_id')
                .lean();

            const assignedUserIds = assignedUsers.map(u => u._id);

            // Count pending validations from assigned users
            let pendingValidationsCount = 0;
            if (assignedUserIds.length > 0) {
                pendingValidationsCount = await UserSkill.countDocuments({
                    userId: { $in: assignedUserIds },
                    validationStatus: { $in: ['none', 'pending'] },
                    source: { $in: ['self', 'resume'] },
                });
            }

            const workload: MentorWorkload = {
                mentorId: mentor._id.toString(),
                mentorName: mentor.name,
                mentorEmail: mentor.email,
                assignedUsersCount,
                pendingValidationsCount,
                isActive: mentor.isActive,
            };

            return workload;
        });

        const mentorWorkloads = await Promise.all(workloadPromises);

        // Sort by assigned users count (descending)
        mentorWorkloads.sort((a, b) => b.assignedUsersCount - a.assignedUsersCount);

        return NextResponse.json({
            success: true,
            mentors: mentorWorkloads,
            total: mentorWorkloads.length,
        });

    } catch (error) {
        console.error('Error in mentor-workload API:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
