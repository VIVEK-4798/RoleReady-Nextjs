/**
 * Admin Change Ticket Status API
 * 
 * PATCH /api/admin/tickets/[id]/status
 * 
 * Change ticket status (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Ticket } from '@/lib/models';
import { auth } from '@/lib/auth';
import { isValidObjectId } from '@/lib/utils/db';
import type { TicketStatus } from '@/lib/models/Ticket';

interface RouteContext {
    params: Promise<{ id: string }>;
}

interface StatusChangeBody {
    status: TicketStatus;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
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
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            return NextResponse.json(
                { success: false, error: 'Ticket not found' },
                { status: 404 }
            );
        }

        // 4. Parse body
        const body: StatusChangeBody = await request.json();
        const { status } = body;

        if (!status || !['open', 'in_progress', 'waiting_user', 'resolved', 'closed'].includes(status)) {
            return NextResponse.json(
                { success: false, error: 'Invalid status' },
                { status: 400 }
            );
        }

        // 5. Update status
        const oldStatus = ticket.status;
        ticket.status = status;
        await ticket.save();

        return NextResponse.json({
            success: true,
            ticket: {
                _id: ticket._id,
                ticketNumber: ticket.ticketNumber,
                status: ticket.status,
                oldStatus,
            },
            message: `Ticket status changed from ${oldStatus} to ${status}`,
        });
    } catch (error) {
        console.error('PATCH /api/admin/tickets/[id]/status error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update status',
            },
            { status: 500 }
        );
    }
}
