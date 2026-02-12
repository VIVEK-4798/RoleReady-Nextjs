/**
 * Admin Email Send API
 * 
 * POST /api/admin/email/send
 * 
 * Sends a single email to one recipient.
 * Admin only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, unauthorizedResponse } from '@/lib/utils/adminAuth';
import { sendAdminEmail } from '@/lib/email/sendEmail';
import { isValidEmail } from '@/lib/utils/csvParser';

export async function POST(request: NextRequest) {
    try {
        // Check admin authorization
        const authResult = await requireAdmin();
        if (!authResult.authorized) {
            return unauthorizedResponse(authResult.error);
        }

        // Parse request body
        const body = await request.json();
        const { recipient, subject, content } = body;

        // Validate required fields
        if (!recipient || !subject || !content) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields: recipient, subject, and content are required',
                },
                { status: 400 }
            );
        }

        // Validate email format
        if (!isValidEmail(recipient)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid email format',
                },
                { status: 400 }
            );
        }

        // Validate subject and content are not empty
        if (subject.trim().length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Subject cannot be empty',
                },
                { status: 400 }
            );
        }

        if (content.trim().length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Content cannot be empty',
                },
                { status: 400 }
            );
        }

        // Send email
        const success = await sendAdminEmail(recipient, subject, content);

        if (!success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to send email. Please check SMTP configuration.',
                },
                { status: 500 }
            );
        }

        // Log admin action
        console.log(`[ADMIN EMAIL] User ${authResult.userId} sent email to ${recipient}`);

        return NextResponse.json({
            success: true,
            message: 'Email sent successfully',
        });
    } catch (error) {
        console.error('POST /api/admin/email/send error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
            },
            { status: 500 }
        );
    }
}
