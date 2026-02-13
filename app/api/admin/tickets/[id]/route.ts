/**
 * Admin Single Ticket API
 * 
 * GET /api/admin/tickets/[id]
 * 
 * Get ticket details with all messages including internal notes (admin only)
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

        // 2. Auth check - Admin only
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Admin access required.' },
                { status: 403 }
            );
        }

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

        // 4. Get all messages (including internal notes for admin)
        const messages = await TicketMessage.find({ ticketId: ticket._id })
            .sort({ createdAt: 1 }) // Chronological order
            .populate('senderId', 'name email role')
            .lean();

        // 5. Get participants
        const participantIds = new Set<string>();
        participantIds.add(ticket.createdBy._id.toString());

        if (ticket.assignedTo) {
            participantIds.add(ticket.assignedTo._id.toString());
        }

        messages.forEach((msg) => {
            participantIds.add(msg.senderId._id.toString());
        });

        // 6. Separate internal and public messages
        const publicMessages = messages.filter((msg) => !msg.isInternal);
        const internalNotes = messages.filter((msg) => msg.isInternal);

        return NextResponse.json({
            success: true,
            ticket: {
                ...ticket,
                messageCount: publicMessages.length,
                internalNoteCount: internalNotes.length,
                participants: Array.from(participantIds).length,
            },
            messages: publicMessages,
            internalNotes,
        });
    } catch (error) {
        console.error('GET /api/admin/tickets/[id] error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch ticket',
            },
            { status: 500 }
        );
    }
}
