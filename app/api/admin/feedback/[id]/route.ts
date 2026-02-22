import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { feedbackService } from '@/services/admin/feedbackService';
import mongoose from 'mongoose';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        // Check admin access
        if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }


        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid feedback ID' }, { status: 400 });
        }

        const body = await req.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const validStatuses = ['new', 'reviewed', 'resolved'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const updatedFeedback = await feedbackService.updateFeedbackStatus(id, status);

        return NextResponse.json(updatedFeedback);
    } catch (error: any) {
        console.error('Error updating feedback status:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update feedback' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        // Check admin access
        if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }


        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid feedback ID' }, { status: 400 });
        }

        const result = await feedbackService.deleteFeedback(id);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error deleting feedback:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete feedback' },
            { status: 500 }
        );
    }
}
