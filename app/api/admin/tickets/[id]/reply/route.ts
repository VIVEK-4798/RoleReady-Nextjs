/**
 * Admin Reply to Ticket API
 * 
 * POST /api/admin/tickets/[id]/reply
 * 
 * Admin can reply to tickets or add internal notes
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Ticket, TicketMessage } from '@/lib/models';
import { auth } from '@/lib/auth';
import { isValidObjectId } from '@/lib/utils/db';

interface RouteContext {
    params: Promise<{ id: string }>;
}

interface AdminReplyBody {
    message: string;
    isInternal?: boolean; // If true, creates an internal note
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

        // 2. Auth check - Admin only
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Admin access required.' },
                { status: 403 }
            );
        }

        const adminId = session.user.id;

        await connectDB();

        // 3. Get ticket
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            return NextResponse.json(
                { success: false, error: 'Ticket not found' },
                { status: 404 }
            );
        }

        // 4. Parse body
        const body: AdminReplyBody = await request.json();
        const { message, isInternal = false } = body;

        if (!message || !message.trim()) {
            return NextResponse.json(
                { success: false, error: 'Message is required' },
                { status: 400 }
            );
        }

        // 5. Create message
        const ticketMessage = new TicketMessage({
            ticketId: ticket._id,
            senderId: adminId,
            senderRole: 'admin',
            message: message.trim(),
            isInternal,
        });

        await ticketMessage.save();

        // 6. Update ticket status if public reply
        if (!isInternal) {
            // Admin replied publicly - set to waiting_user
            if (ticket.status === 'open' || ticket.status === 'in_progress') {
                ticket.status = 'waiting_user';
            }

            ticket.lastMessageAt = new Date();

            // Auto-assign to this admin if not assigned
            if (!ticket.assignedTo) {
                ticket.assignedTo = adminId as any;
            }

            await ticket.save();
        }

        // 7. Populate message for response
        await ticketMessage.populate('senderId', 'name email role');

        return NextResponse.json({
            success: true,
            message: ticketMessage,
            ticket: {
                _id: ticket._id,
                status: ticket.status,
                lastMessageAt: ticket.lastMessageAt,
                assignedTo: ticket.assignedTo,
            },
            isInternal,
        });
    } catch (error) {
        console.error('POST /api/admin/tickets/[id]/reply error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send reply',
            },
            { status: 500 }
        );
    }
}
