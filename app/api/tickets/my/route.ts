/**
 * My Tickets API
 * 
 * GET /api/tickets/my
 * 
 * Get tickets created by the authenticated user/mentor
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Ticket, TicketMessage } from '@/lib/models';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // 1. Auth check
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        await connectDB();

        // 2. Parse query parameters
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status'); // Filter by status

        // Validate pagination
        const validPage = Math.max(1, page);
        const validLimit = Math.min(Math.max(1, limit), 50); // Max 50 per page

        // 3. Build query
        const query: any = { createdBy: userId };

        if (status && ['open', 'in_progress', 'waiting_user', 'resolved', 'closed'].includes(status)) {
            query.status = status;
        }

        // 4. Get tickets with pagination
        const skip = (validPage - 1) * validLimit;

        const [tickets, total] = await Promise.all([
            Ticket.find(query)
                .sort({ lastMessageAt: -1 }) // Most recent first
                .skip(skip)
                .limit(validLimit)
                .populate('createdBy', 'name email')
                .populate('assignedTo', 'name email')
                .lean(),
            Ticket.countDocuments(query),
        ]);

        // 5. Get unread message counts for each ticket
        const ticketsWithCounts = await Promise.all(
            tickets.map(async (ticket) => {
                const messageCount = await TicketMessage.countDocuments({
                    ticketId: ticket._id,
                });

                return {
                    ...ticket,
                    messageCount,
                };
            })
        );

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
        });
    } catch (error) {
        console.error('GET /api/tickets/my error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch tickets',
            },
            { status: 500 }
        );
    }
}
