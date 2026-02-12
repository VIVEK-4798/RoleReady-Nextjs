/**
 * Reset Password
 * 
 * POST /api/auth/forgot-password/reset
 * 
 * Resets user password after OTP verification.
 * Validates OTP one final time before password change.
 * 
 * Security:
 * - Verifies OTP again before reset
 * - Hashes new password with bcrypt
 * - Invalidates all OTPs after successful reset
 * - Sends confirmation email
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/mongoose';
import { User, Otp } from '@/lib/models';
import { verifyOTP, isOTPExpired, sanitizeEmail } from '@/lib/utils/otp';
import { sendPasswordResetSuccess } from '@/lib/utils/email';

const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();
        const { email, otp, newPassword } = body;

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

        if (!newPassword || typeof newPassword !== 'string') {
            return NextResponse.json(
                { success: false, error: 'New password is required' },
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

        // Validate password strength
        if (newPassword.length < 8) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 8 characters long' },
                { status: 400 }
            );
        }

        // Additional password validation (optional but recommended)
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumber = /[0-9]/.test(newPassword);

        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                },
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

            otpDoc.used = true;
            await otpDoc.save();

            return NextResponse.json(
                { success: false, error: 'Too many failed attempts. Please request a new OTP.' },
                { status: 400 }
            );
        }

        // Verify OTP one final time
        const isValid = verifyOTP(otp, otpDoc.otpHash);

        if (!isValid) {
            // Increment attempts
            otpDoc.attempts += 1;
            await otpDoc.save();

            console.log(`⚠️ Invalid OTP attempt during reset for ${sanitizedEmail}`);

            return NextResponse.json(
                { success: false, error: genericError },
                { status: 400 }
            );
        }

        // Find user
        const user = await User.findOne({ email: sanitizedEmail });

        if (!user) {
            console.log(`⚠️ User not found for ${sanitizedEmail}`);

            // Mark OTP as used even if user not found
            otpDoc.used = true;
            await otpDoc.save();

            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if user is OAuth user (no password)
        if (!user.password && user.emailVerified) {
            console.log(`⚠️ OAuth user attempted password reset: ${sanitizedEmail}`);

            otpDoc.used = true;
            await otpDoc.save();

            return NextResponse.json(
                {
                    success: false,
                    error: 'This account uses social login. Please sign in with Google instead.'
                },
                { status: 400 }
            );
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user password
        user.password = hashedPassword;
        await user.save();

        // Mark OTP as used
        otpDoc.used = true;
        await otpDoc.save();

        // Invalidate all other OTPs for this email (cleanup)
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

        // Send success email (don't wait for it)
        sendPasswordResetSuccess(sanitizedEmail).catch((error) => {
            console.error('Failed to send password reset success email:', error);
            // Don't fail the request if email fails
        });

        console.log(`✅ Password reset successful for ${sanitizedEmail}`);

        return NextResponse.json({
            success: true,
            message: 'Password reset successful. You can now log in with your new password.',
        });

    } catch (error) {
        console.error('Reset password error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'An error occurred. Please try again later.'
            },
            { status: 500 }
        );
    }
}
