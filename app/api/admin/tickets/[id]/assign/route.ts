/**
 * Admin Assign Ticket API
 * 
 * PATCH /api/admin/tickets/[id]/assign
 * 
 * Assign ticket to an admin (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Ticket, User } from '@/lib/models';
import { auth } from '@/lib/auth';
import { isValidObjectId } from '@/lib/utils/db';

interface RouteContext {
    params: Promise<{ id: string }>;
}

interface AssignBody {
    adminId: string | null; // null to unassign
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
        const body: AssignBody = await request.json();
        const { adminId } = body;

        // 5. Handle unassignment
        if (adminId === null) {
            ticket.assignedTo = undefined;
            await ticket.save();

            return NextResponse.json({
                success: true,
                ticket: {
                    _id: ticket._id,
                    ticketNumber: ticket.ticketNumber,
                    assignedTo: null,
                },
                message: 'Ticket unassigned successfully',
            });
        }

        // 6. Validate admin ID
        if (!isValidObjectId(adminId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid admin ID' },
                { status: 400 }
            );
        }

        // 7. Verify admin exists and is actually an admin
        const admin = await User.findById(adminId).select('role name email').lean();

        if (!admin) {
            return NextResponse.json(
                { success: false, error: 'Admin not found' },
                { status: 404 }
            );
        }

        if (admin.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'User is not an admin' },
                { status: 400 }
            );
        }

        // 8. Assign ticket
        ticket.assignedTo = adminId as any;
        await ticket.save();

        // 9. Populate for response
        await ticket.populate('assignedTo', 'name email');

        return NextResponse.json({
            success: true,
            ticket: {
                _id: ticket._id,
                ticketNumber: ticket.ticketNumber,
                assignedTo: ticket.assignedTo,
            },
            message: `Ticket assigned to ${admin.name}`,
        });
    } catch (error) {
        console.error('PATCH /api/admin/tickets/[id]/assign error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to assign ticket',
            },
            { status: 500 }
        );
    }
}
