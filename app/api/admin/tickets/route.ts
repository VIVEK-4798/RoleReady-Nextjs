/**
 * Admin Tickets List API
 * 
 * GET /api/admin/tickets
 * 
 * List all tickets with filters (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Ticket, TicketMessage } from '@/lib/models';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // 1. Auth check - Admin only
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Admin access required.' },
                { status: 403 }
            );
        }

        await connectDB();

        // 2. Parse query parameters
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const role = searchParams.get('role');
        const search = searchParams.get('search'); // Search by subject or ticketNumber

        // Validate pagination
        const validPage = Math.max(1, page);
        const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 per page

        // 3. Build query
        const query: any = {};

        if (status && ['open', 'in_progress', 'waiting_user', 'resolved', 'closed'].includes(status)) {
            query.status = status;
        }

        if (priority && ['low', 'medium', 'high'].includes(priority)) {
            query.priority = priority;
        }

        if (role && ['user', 'mentor'].includes(role)) {
            query.role = role;
        }

        if (search && search.trim()) {
            query.$or = [
                { ticketNumber: { $regex: search.trim(), $options: 'i' } },
                { subject: { $regex: search.trim(), $options: 'i' } },
            ];
        }

        // 4. Get tickets with pagination
        const skip = (validPage - 1) * validLimit;

        const [tickets, total] = await Promise.all([
            Ticket.find(query)
                .sort({ lastMessageAt: -1 }) // Most recent first
                .skip(skip)
                .limit(validLimit)
                .populate('createdBy', 'name email role')
                .populate('assignedTo', 'name email')
                .lean(),
            Ticket.countDocuments(query),
        ]);

        // 5. Get message counts for each ticket
        const ticketsWithCounts = await Promise.all(
            tickets.map(async (ticket) => {
                const messageCount = await TicketMessage.countDocuments({
                    ticketId: ticket._id,
                });

                // Get last message
                const lastMessage = await TicketMessage.findOne({
                    ticketId: ticket._id,
                })
                    .sort({ createdAt: -1 })
                    .select('message senderRole createdAt')
                    .lean();

                return {
                    ...ticket,
                    messageCount,
                    lastMessage,
                };
            })
        );

        // 6. Get summary statistics
        const stats = await Ticket.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const statusCounts = stats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
        }, {} as Record<string, number>);

        return NextResponse.json({
            success: true,
            tickets: ticketsWithCounts,
            pagination: {
                page: validPage,
                limit: validLimit,
                total,
                totalPages: Math.ceil(total / validLimit),
                hasMore: validPage * validLimit < total,
            },
            stats: {
                total,
                byStatus: statusCounts,
            },
        });
    } catch (error) {
        console.error('GET /api/admin/tickets error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch tickets',
            },
            { status: 500 }
        );
    }
}
