import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import Feedback from '@/lib/models/Feedback';

/**
 * Basic in-memory rate limiting
 * { IP: { count: number, resetTime: number, lastMessage: string, lastMessageTime: number } }
 */
const rateLimit = new Map<string, { count: number; resetTime: number; lastMessage: string; lastMessageTime: number }>();

const RATE_LIMIT_COUNT = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const DUPLICATE_WINDOW = 10 * 60 * 1000; // 10 minutes

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, message, type } = body;

        // Get IP - handling various deployment scenarios
        const forwarded = req.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

        const session = await auth();
        // Prioritize the email sent from the form, fallback to session
        const userEmail = (email || session?.user?.email || '').trim();

        // 1. Basic Validation
        if (!userEmail || !message) {
            return NextResponse.json(
                { error: 'Email and message are required' },
                { status: 400 }
            );
        }

        const validTypes = ['suggestion', 'issue', 'praise', 'other'];
        if (type && !validTypes.includes(type)) {
            return NextResponse.json(
                { error: 'Invalid feedback type' },
                { status: 400 }
            );
        }

        // Always validate email format since the user can edit it even if logged in
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(userEmail)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        if (message.trim().length < 10) {
            return NextResponse.json(
                { error: 'Message must be at least 10 characters' },
                { status: 400 }
            );
        }

        if (message.length > 2000) {
            return NextResponse.json(
                { error: 'Message cannot exceed 2000 characters' },
                { status: 400 }
            );
        }

        // 2. Spam Protection / Rate Limiting
        const now = Date.now();
        const userLimit = rateLimit.get(ip);

        if (userLimit) {
            // Check hourly limit
            if (now < userLimit.resetTime) {
                if (userLimit.count >= RATE_LIMIT_COUNT) {
                    return NextResponse.json(
                        { error: 'Too many submissions. Please try again later.' },
                        { status: 429 }
                    );
                }
            } else {
                // Reset window
                userLimit.count = 0;
                userLimit.resetTime = now + RATE_LIMIT_WINDOW;
            }

            // Check duplicate message (identical content within 10 mins)
            if (userLimit.lastMessage === message.trim() && now < userLimit.lastMessageTime + DUPLICATE_WINDOW) {
                return NextResponse.json(
                    { error: 'Duplicate feedback detected recently.' },
                    { status: 429 }
                );
            }

            // Update limit
            userLimit.count += 1;
            userLimit.lastMessage = message.trim();
            userLimit.lastMessageTime = now;
        } else {
            // Initial limit entry
            rateLimit.set(ip, {
                count: 1,
                resetTime: now + RATE_LIMIT_WINDOW,
                lastMessage: message.trim(),
                lastMessageTime: now,
            });
        }

        // 3. Save Feedback
        await connectDB();

        await Feedback.create({
            email: userEmail.toLowerCase().trim(),
            message: message.trim(),
            type: type || 'suggestion',
            ...(session?.user?.id && { userId: session.user.id }),
            ipAddress: ip,
            status: 'new',
        });

        // 4. Send Thank You Email (Non-blocking)
        try {
            const { sendFeedbackThankYouEmail } = await import('@/services/email/feedbackEmailService');
            // We don't await this to keep the API response fast
            sendFeedbackThankYouEmail({
                email: userEmail.toLowerCase().trim(),
                type: type || 'suggestion'
            }).catch(err => console.error('Delayed email error:', err));
        } catch (emailError) {
            console.error('Failed to trigger thank you email:', emailError);
        }

        return NextResponse.json(
            { message: 'Thank you for your feedback!' },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Feedback submission error:', error);
        return NextResponse.json(
            { error: 'Failed to submit feedback. Please try again.' },
            { status: 500 }
        );
    }
}
