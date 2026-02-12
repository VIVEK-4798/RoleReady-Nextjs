/**
 * Send Password Reset OTP
 * 
 * POST /api/auth/forgot-password/send-otp
 * 
 * Generates and sends a 6-digit OTP to the user's email.
 * OTP is hashed before storage for security.
 * 
 * Security:
 * - Does not reveal if email exists
 * - Rate limiting recommended (implement in middleware)
 * - OTP expires in 10 minutes
 * - Previous unused OTPs are invalidated
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User, Otp } from '@/lib/models';
import { generateOTP, hashOTP, getOTPExpiry, sanitizeEmail } from '@/lib/utils/otp';
import { sendPasswordResetOTP } from '@/lib/utils/email';

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();
        const { email } = body;

        // Validate input
        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        // Sanitize email
        const sanitizedEmail = sanitizeEmail(email);

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitizedEmail)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDB();

        // Check if user exists (but don't reveal this to the client for security)
        const user = await User.findOne({ email: sanitizedEmail }).select('_id email');

        // Always return success to prevent email enumeration
        // But only send email if user exists
        if (user) {
            // Generate OTP
            const otp = generateOTP();
            const otpHash = hashOTP(otp);
            const expiresAt = getOTPExpiry(10); // 10 minutes

            // Invalidate all previous unused OTPs for this email
            await Otp.updateMany(
                {
                    email: sanitizedEmail,
                    purpose: 'password-reset',
                    used: false,
                },
                {
                    $set: { used: true },
                }
            );

            // Create new OTP document
            await Otp.create({
                email: sanitizedEmail,
                otpHash,
                purpose: 'password-reset',
                expiresAt,
                used: false,
                attempts: 0,
            });

            // Send OTP via email
            const emailSent = await sendPasswordResetOTP(sanitizedEmail, otp, 10);

            if (!emailSent) {
                console.error('Failed to send OTP email to:', sanitizedEmail);
                // Don't reveal email send failure to client
                // Log it for admin monitoring
            }

            console.log(`✅ OTP sent to ${sanitizedEmail} (expires at ${expiresAt.toISOString()})`);
        } else {
            console.log(`⚠️ Password reset requested for non-existent email: ${sanitizedEmail}`);
            // Still return success to prevent email enumeration
        }

        // Always return success (security best practice)
        return NextResponse.json({
            success: true,
            message: 'If the email exists, an OTP has been sent',
        });

    } catch (error) {
        console.error('Send OTP error:', error);

        // Never expose internal errors to client
        return NextResponse.json(
            {
                success: false,
                error: 'An error occurred. Please try again later.'
            },
            { status: 500 }
        );
    }
}
