/**
 * Verify OTP API Route
 * 
 * POST /api/auth/verify-otp
 * 
 * Verifies an OTP and returns a token for password reset.
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Otp from '@/lib/models/Otp';
import { successResponse, errors } from '@/lib/utils/api';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, role = 'user', otp, purpose = 'password-reset' } = body;

    // Validate required fields
    if (!email || !otp) {
      return errors.validationError('Email and OTP are required');
    }

    // Find the OTP record
    const otpRecord = await Otp.findOne({
      email: email.toLowerCase(),
      role,
      purpose,
      otp,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return errors.badRequest('Invalid or expired OTP');
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Generate a reset token (for password reset flow)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Store the reset token (in production, save to DB with expiry)
    // For now, we'll use a simple approach - the token is the OTP record ID
    // This is simplified for the migration; enhance as needed

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
