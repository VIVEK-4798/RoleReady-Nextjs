/**
 * Reply to Ticket API
 * 
 * POST /api/tickets/[id]/reply
 * 
 * Add a reply/message to a ticket
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Ticket, TicketMessage } from '@/lib/models';
import { auth } from '@/lib/auth';
import { isValidObjectId } from '@/lib/utils/db';

interface RouteContext {
    params: Promise<{ id: string }>;
}

interface ReplyBody {
    message: string;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
    try {
        const { id: ticketId } = await params;

        // 1. Validate ID
        if (!isValidObjectId(ticketId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid ticket ID' },
                { status: 400 }
            );
        }

        // 2. Auth check
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const userRole = session.user.role || 'user';

        await connectDB();

        // 3. Get ticket
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            return NextResponse.json(
                { success: false, error: 'Ticket not found' },
                { status: 404 }
            );
        }

        // 4. Authorization check
        // Only ticket creator or admin can reply
        if (ticket.createdBy.toString() !== userId && userRole !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Access denied' },
                { status: 403 }
            );
        }

        // 5. Check if ticket is closed
        if (ticket.status === 'closed') {
            return NextResponse.json(
                { success: false, error: 'Cannot reply to closed ticket' },
                { status: 400 }
            );
        }

        // 6. Parse body
        const body: ReplyBody = await request.json();
        const { message } = body;

        if (!message || !message.trim()) {
            return NextResponse.json(
                { success: false, error: 'Message is required' },
                { status: 400 }
            );
        }

        // 7. Determine sender role
        let senderRole: 'user' | 'mentor' | 'admin';
        if (userRole === 'admin') {
            senderRole = 'admin';
        } else if (userRole === 'mentor') {
            senderRole = 'mentor';
        } else {
            senderRole = 'user';
        }

        // 8. Create message
        const ticketMessage = new TicketMessage({
            ticketId: ticket._id,
            senderId: userId,
            senderRole,
            message: message.trim(),
            isInternal: false,
        });

        await ticketMessage.save();

        // 9. Update ticket status based on who replied
        let newStatus = ticket.status;

        if (senderRole === 'admin') {
            // Admin replied - set to waiting_user
            if (ticket.status === 'open' || ticket.status === 'in_progress') {
                newStatus = 'waiting_user';
            }
        } else {
            // User/mentor replied
            if (ticket.status === 'waiting_user') {
                newStatus = 'open';
            } else if (ticket.status === 'resolved') {
                // Reopening resolved ticket
                newStatus = 'open';
            }
        }

        // Update ticket
        ticket.status = newStatus;
        ticket.lastMessageAt = new Date();
        await ticket.save();

        // 10. Populate message for response
        await ticketMessage.populate('senderId', 'name email role');

        return NextResponse.json({
            success: true,
            message: ticketMessage,
            ticket: {
                _id: ticket._id,
                status: ticket.status,
                lastMessageAt: ticket.lastMessageAt,
            },
        });
    } catch (error) {
        console.error('POST /api/tickets/[id]/reply error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send reply',
            },
            { status: 500 }
        );
    }
}
