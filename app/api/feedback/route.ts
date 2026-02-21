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
        const { email, message } = body;

        // Get IP - handling various deployment scenarios
        const forwarded = req.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

        // 1. Basic Validation
        if (!email || !message) {
            return NextResponse.json(
                { error: 'Email and message are required' },
                { status: 400 }
            );
        }

        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
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
        const session = await auth();

        await Feedback.create({
            email: email.toLowerCase().trim(),
            message: message.trim(),
            ...(session?.user?.id && { userId: session.user.id }),
            ipAddress: ip,
            status: 'new',
        });

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
