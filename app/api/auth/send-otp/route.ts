/**
 * Send OTP API Route
 * 
 * POST /api/auth/send-otp
 * 
 * Generates and sends an OTP to the user's email for password reset.
 * Uses the new secure OTP schema with hashing.
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';
import Otp from '@/lib/models/Otp';
import { successResponse, errors } from '@/lib/utils/api';
import config from '@/config';
import { generateOTP, hashOTP, getOTPExpiry } from '@/lib/utils/otp';
import { sendPasswordResetOTP } from '@/lib/utils/email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, purpose = 'password-reset' } = body;

    // Validate required fields
    if (!email) {
      return errors.validationError('Email is required');
    }

    // Validate purpose
    const allowedPurposes = ['password-reset', 'email-verification'];
    if (!allowedPurposes.includes(purpose)) {
      return errors.validationError('Invalid purpose');
    }

    // Sanitize email
    const sanitizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await User.findOne({
      email: sanitizedEmail,
      isActive: true,
    });

    if (!user) {
      // Don't reveal if user exists or not (security)
      return successResponse(
        null,
        'If an account exists with this email, an OTP has been sent.'
      );
    }

    // Delete any existing unused OTPs for this email/purpose
    await Otp.updateMany(
      {
        email: sanitizedEmail,
        purpose,
        used: false,
      },
      {
        $set: { used: true },
      }
    );

    // Generate new OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = getOTPExpiry(config.auth.otpExpiryMinutes || 10);

    // Save OTP to database with new schema
    await Otp.create({
      email: sanitizedEmail,
      otpHash,
      purpose,
      expiresAt,
      used: false,
      attempts: 0,
    });

    // Send OTP via email (only for password reset)
    if (purpose === 'password-reset') {
      const emailSent = await sendPasswordResetOTP(
        sanitizedEmail,
        otp,
        config.auth.otpExpiryMinutes || 10
      );

      if (!emailSent) {
        console.error('Failed to send OTP email to:', sanitizedEmail);
      }
    }

    // Log OTP in development
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      console.log(`[DEV] OTP for ${sanitizedEmail}: ${otp}`);
    }

    return successResponse(
      isDevelopment ? { otp, expiresInMinutes: config.auth.otpExpiryMinutes || 10 } : null,
      'If an account exists with this email, an OTP has been sent.'
    );
  } catch (error) {
    console.error('POST /api/auth/send-otp error:', error);
    return errors.serverError('Failed to send OTP');
  }
}
