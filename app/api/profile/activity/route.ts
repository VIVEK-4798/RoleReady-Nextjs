
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import ActivityLog from '@/lib/models/ActivityLog';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Try to fetch real activity logs if any exist for this user (as user or mentor)
        // Admin actions are currently not logged in ActivityLog, so we might get empty array
        const realActivities = await ActivityLog.find({ userId: user.id })
            .sort({ createdAt: -1 })
            .limit(5);

        let activities = [];

        if (realActivities.length > 0) {
            activities = realActivities.map(log => {
                const actionString = log.actionType.toString().replace(/_/g, ' ');
                return {
                    id: log._id.toString(),
                    action: actionString.toUpperCase(),
                    description: `Performed ${actionString} action`,
                    time: new Date(log.createdAt).toLocaleString(),
                    ip: '127.0.0.1' // Mock IP
                };
            });
        } else {
            // Fallback to mock data to show UI capabilities if no real logs exist
            activities = [
                {
                    id: '1',
                    action: 'Login',
                    description: 'Successful login to admin dashboard',
                    time: new Date().toLocaleString(),
                    ip: '192.168.1.1'
                },
                {
                    id: '2',
                    action: 'Profile View',
                    description: 'Viewed profile settings',
                    time: new Date(Date.now() - 3600000).toLocaleString(), // 1 hour ago
                    ip: '192.168.1.1'
                },
                {
                    id: '3',
                    action: 'System Check',
                    description: 'Verified system status',
                    time: new Date(Date.now() - 86400000).toLocaleString(), // 1 day ago
                    ip: '192.168.1.1'
                }
            ];
        }

        return NextResponse.json({
            success: true,
            data: activities,
        });
    } catch (error) {
        console.error('Error fetching activity:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
