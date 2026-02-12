/**
 * Verify Password Reset OTP
 * 
 * POST /api/auth/forgot-password/verify-otp
 * 
 * Verifies the OTP provided by the user.
 * Tracks failed attempts and invalidates after 5 failures.
 * 
 * Security:
 * - Constant-time comparison
 * - Max 5 attempts per OTP
 * - Checks expiry
 * - Does not reveal specific failure reason
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Otp } from '@/lib/models';
import { verifyOTP, isOTPExpired, sanitizeEmail } from '@/lib/utils/otp';

const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();
        const { email, otp } = body;

        // Validate inputs
        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        if (!otp || typeof otp !== 'string') {
            return NextResponse.json(
                { success: false, error: 'OTP is required' },
                { status: 400 }
            );
        }

        // Validate OTP format (6 digits)
        if (!/^\d{6}$/.test(otp)) {
            return NextResponse.json(
                { success: false, error: 'Invalid OTP format' },
                { status: 400 }
            );
        }

        // Sanitize email
        const sanitizedEmail = sanitizeEmail(email);

        // Connect to database
        await connectDB();

        // Find the latest unused OTP for this email
        const otpDoc = await Otp.findOne({
            email: sanitizedEmail,
            purpose: 'password-reset',
            used: false,
        }).sort({ createdAt: -1 });

        // Generic error message for security
        const genericError = 'Invalid or expired OTP';

        // Check if OTP exists
        if (!otpDoc) {
            console.log(`⚠️ No active OTP found for ${sanitizedEmail}`);
            return NextResponse.json(
                { success: false, error: genericError },
                { status: 400 }
            );
        }

        // Check if OTP has expired
        if (isOTPExpired(otpDoc.expiresAt)) {
            console.log(`⚠️ Expired OTP for ${sanitizedEmail}`);

            // Mark as used to prevent further attempts
            otpDoc.used = true;
            await otpDoc.save();

            return NextResponse.json(
                { success: false, error: genericError },
                { status: 400 }
            );
        }

        // Check if max attempts exceeded
        if (otpDoc.attempts >= MAX_ATTEMPTS) {
            console.log(`⚠️ Max attempts exceeded for ${sanitizedEmail}`);

            // Mark as used to prevent further attempts
            otpDoc.used = true;
            await otpDoc.save();

            return NextResponse.json(
                { success: false, error: 'Too many failed attempts. Please request a new OTP.' },
                { status: 400 }
            );
        }

        // Verify OTP
        const isValid = verifyOTP(otp, otpDoc.otpHash);

        if (!isValid) {
            // Increment attempts
            otpDoc.attempts += 1;
            await otpDoc.save();

            console.log(`⚠️ Invalid OTP attempt ${otpDoc.attempts}/${MAX_ATTEMPTS} for ${sanitizedEmail}`);

            // Check if this was the last attempt
            if (otpDoc.attempts >= MAX_ATTEMPTS) {
                otpDoc.used = true;
                await otpDoc.save();

                return NextResponse.json(
                    { success: false, error: 'Too many failed attempts. Please request a new OTP.' },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { success: false, error: genericError },
                { status: 400 }
            );
        }

        // OTP is valid!
        console.log(`✅ OTP verified successfully for ${sanitizedEmail}`);

        // Return success
        // Note: We don't mark as used yet - that happens during password reset
        // This allows the user to verify OTP before actually resetting password
        return NextResponse.json({
            success: true,
            message: 'OTP verified successfully',
        });

    } catch (error) {
        console.error('Verify OTP error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'An error occurred. Please try again later.'
            },
            { status: 500 }
        );
    }
}
