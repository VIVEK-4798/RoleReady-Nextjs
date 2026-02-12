/**
 * Admin Bulk Email Send API
 * 
 * POST /api/admin/email/bulk
 * 
 * Sends emails to multiple recipients.
 * Admin only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, unauthorizedResponse } from '@/lib/utils/adminAuth';
import { sendBulkEmails } from '@/lib/email/sendEmail';
import { deduplicateEmails } from '@/lib/utils/csvParser';

const MAX_RECIPIENTS = 200;

export async function POST(request: NextRequest) {
    try {
        // Check admin authorization
        const authResult = await requireAdmin();
        if (!authResult.authorized) {
            return unauthorizedResponse(authResult.error);
        }

        // Parse request body
        const body = await request.json();
        const { recipients, subject, content } = body;

        // Validate required fields
        if (!recipients || !subject || !content) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields: recipients, subject, and content are required',
                },
                { status: 400 }
            );
        }

        // Validate recipients is an array
        if (!Array.isArray(recipients)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Recipients must be an array of email addresses',
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

        // Deduplicate and validate emails
        const validEmails = deduplicateEmails(recipients);

        if (validEmails.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No valid email addresses provided',
                },
                { status: 400 }
            );
        }

        // Check batch size limit
        if (validEmails.length > MAX_RECIPIENTS) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Too many recipients. Maximum ${MAX_RECIPIENTS} emails per request. You provided ${validEmails.length}.`,
                },
                { status: 400 }
            );
        }

        // Send bulk emails
        const result = await sendBulkEmails(validEmails, subject, content);

        // Log admin action
        console.log(
            `[ADMIN BULK EMAIL] User ${authResult.userId} sent ${result.sent} emails (${result.failed} failed) to ${validEmails.length} recipients`
        );

        // Log failures for debugging
        if (result.failed > 0) {
            const failedEmails = result.results
                .filter(r => !r.success)
                .map(r => r.email);
            console.error('[ADMIN BULK EMAIL] Failed emails:', failedEmails);
        }

        return NextResponse.json({
            success: true,
            sent: result.sent,
            failed: result.failed,
            total: validEmails.length,
        });
    } catch (error) {
        console.error('POST /api/admin/email/bulk error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
            },
            { status: 500 }
        );
    }
}
