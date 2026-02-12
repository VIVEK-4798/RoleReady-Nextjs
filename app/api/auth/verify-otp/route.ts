/**
 * Verify OTP API Route
 * 
 * POST /api/auth/verify-otp
 * 
 * Verifies an OTP and returns a token for password reset.
 * Uses the new secure OTP schema with hash verification.
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Otp from '@/lib/models/Otp';
import { successResponse, errors } from '@/lib/utils/api';
import { verifyOTP, isOTPExpired } from '@/lib/utils/otp';
import crypto from 'crypto';

const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, otp, purpose = 'password-reset' } = body;

    // Validate required fields
    if (!email || !otp) {
      return errors.validationError('Email and OTP are required');
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return errors.validationError('Invalid OTP format');
    }

    // Sanitize email
    const sanitizedEmail = email.toLowerCase().trim();

    // Find the latest unused OTP for this email
    const otpRecord = await Otp.findOne({
      email: sanitizedEmail,
      purpose,
      used: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return errors.badRequest('Invalid or expired OTP');
    }

    // Check if OTP has expired
    if (isOTPExpired(otpRecord.expiresAt)) {
      otpRecord.used = true;
      await otpRecord.save();
      return errors.badRequest('Invalid or expired OTP');
    }

    // Check if max attempts exceeded
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      otpRecord.used = true;
      await otpRecord.save();
      return errors.badRequest('Too many failed attempts. Please request a new OTP.');
    }

    // Verify OTP using hash
    const isValid = verifyOTP(otp, otpRecord.otpHash);

    if (!isValid) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();

      if (otpRecord.attempts >= MAX_ATTEMPTS) {
        otpRecord.used = true;
        await otpRecord.save();
        return errors.badRequest('Too many failed attempts. Please request a new OTP.');
      }

      return errors.badRequest('Invalid or expired OTP');
    }

    // Generate a reset token (for password reset flow)
    const resetToken = crypto.randomBytes(32).toString('hex');

    return successResponse(
      {
        verified: true,
        resetToken: otpRecord._id.toString(),
      },
      'OTP verified successfully'
    );
  } catch (error) {
    console.error('POST /api/auth/verify-otp error:', error);
    return errors.serverError('Failed to verify OTP');
  }
}
