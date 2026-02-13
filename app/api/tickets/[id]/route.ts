/**
 * Single Ticket Details API
 * 
 * GET /api/tickets/[id]
 * 
 * Get ticket details with all messages
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Ticket, TicketMessage } from '@/lib/models';
import { auth } from '@/lib/auth';
import { isValidObjectId } from '@/lib/utils/db';

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
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
        const ticket = await Ticket.findById(ticketId)
            .populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email')
            .lean();

        if (!ticket) {
            return NextResponse.json(
                { success: false, error: 'Ticket not found' },
                { status: 404 }
            );
        }

        // 4. Authorization check
        // Only ticket creator or admin can view
        if (ticket.createdBy._id.toString() !== userId && userRole !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Access denied' },
                { status: 403 }
            );
        }

        // 5. Get all messages (exclude internal notes for non-admins)
        const messageQuery: any = { ticketId: ticket._id };

        if (userRole !== 'admin') {
            messageQuery.isInternal = { $ne: true };
        }

        const messages = await TicketMessage.find(messageQuery)
            .sort({ createdAt: 1 }) // Chronological order
            .populate('senderId', 'name email role')
            .lean();

        // 6. Get participants
        const participantIds = new Set<string>();
        participantIds.add(ticket.createdBy._id.toString());

        if (ticket.assignedTo) {
            participantIds.add(ticket.assignedTo._id.toString());
        }

        messages.forEach((msg) => {
            participantIds.add(msg.senderId._id.toString());
        });

        return NextResponse.json({
            success: true,
            ticket: {
                ...ticket,
                messageCount: messages.length,
                participants: Array.from(participantIds).length,
            },
            messages,
        });
    } catch (error) {
        console.error('GET /api/tickets/[id] error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch ticket',
            },
            { status: 500 }
        );
    }
}
