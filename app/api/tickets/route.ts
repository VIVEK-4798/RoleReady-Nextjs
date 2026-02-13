/**
 * Create Ticket API
 * 
 * POST /api/tickets
 * 
 * Allows users and mentors to create support tickets
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Ticket, TicketMessage } from '@/lib/models';
import { auth } from '@/lib/auth';
import type { TicketCategory, TicketPriority } from '@/lib/models/Ticket';

interface CreateTicketBody {
    subject: string;
    category: TicketCategory;
    priority: TicketPriority;
    message: string;
}

export async function POST(request: NextRequest) {
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
        const userRole = session.user.role || 'user';

        // Only users and mentors can create tickets
        if (userRole === 'admin') {
            return NextResponse.json(
                { success: false, error: 'Admins cannot create tickets. Use admin panel to manage tickets.' },
                { status: 403 }
            );
        }

        await connectDB();

        // 2. Parse and validate body
        const body: CreateTicketBody = await request.json();
        const { subject, category, priority, message } = body;

        if (!subject || !subject.trim()) {
            return NextResponse.json(
                { success: false, error: 'Subject is required' },
                { status: 400 }
            );
        }

        if (!message || !message.trim()) {
            return NextResponse.json(
                { success: false, error: 'Message is required' },
                { status: 400 }
            );
        }

        if (!['bug', 'feature', 'account', 'payment', 'other'].includes(category)) {
            return NextResponse.json(
                { success: false, error: 'Invalid category' },
                { status: 400 }
            );
        }

        if (!['low', 'medium', 'high'].includes(priority)) {
            return NextResponse.json(
                { success: false, error: 'Invalid priority' },
                { status: 400 }
            );
        }

        // 3. Create ticket
        const ticket = new Ticket({
            createdBy: userId,
            role: userRole === 'mentor' ? 'mentor' : 'user',
            subject: subject.trim(),
            category,
            priority,
            status: 'open',
            lastMessageAt: new Date(),
        });

        await ticket.save();

        // 4. Create first message
        const ticketMessage = new TicketMessage({
            ticketId: ticket._id,
            senderId: userId,
            senderRole: userRole === 'mentor' ? 'mentor' : 'user',
            message: message.trim(),
            isInternal: false,
        });

        await ticketMessage.save();

        // 5. Populate ticket for response
        await ticket.populate('createdBy', 'name email');

        return NextResponse.json({
            success: true,
            ticket: {
                _id: ticket._id,
                ticketNumber: ticket.ticketNumber,
                subject: ticket.subject,
                category: ticket.category,
                priority: ticket.priority,
                status: ticket.status,
                createdAt: ticket.createdAt,
                createdBy: ticket.createdBy,
            },
            message: 'Ticket created successfully',
        });
    } catch (error) {
        console.error('POST /api/tickets error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create ticket',
            },
            { status: 500 }
        );
    }
}
