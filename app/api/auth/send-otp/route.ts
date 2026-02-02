/**
 * Send OTP API Route
 * 
 * POST /api/auth/send-otp
 * 
 * Generates and sends an OTP to the user's email for password reset.
 * In production, this would send an actual email.
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';
import Otp from '@/lib/models/Otp';
import { successResponse, errors } from '@/lib/utils/api';
import config from '@/config';

/**
 * Generate a 6-digit OTP
 */
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, role = 'user', purpose = 'password-reset' } = body;

    // Validate required fields
    if (!email) {
      return errors.validationError('Email is required');
    }

    // Validate role
    const allowedRoles = ['user', 'mentor', 'admin'];
    if (!allowedRoles.includes(role)) {
      return errors.validationError('Invalid role');
    }

    // Validate purpose
    const allowedPurposes = ['password-reset', 'email-verification'];
    if (!allowedPurposes.includes(purpose)) {
      return errors.validationError('Invalid purpose');
    }

    // Check if user exists
    const user = await User.findOne({
      email: email.toLowerCase(),
      role,
      isActive: true,
    });

    if (!user) {
      // Don't reveal if user exists or not (security)
      return successResponse(
        null,
        'If an account exists with this email, an OTP has been sent.'
      );
    }

    // Delete any existing unused OTPs for this email/role/purpose
    await Otp.deleteMany({
      email: email.toLowerCase(),
      role,
      purpose,
      isUsed: false,
    });

    // Generate new OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + config.auth.otpExpiryMinutes * 60 * 1000);

    // Save OTP to database
    await Otp.create({
      email: email.toLowerCase(),
      otp,
      role,
      purpose,
      expiresAt,
      isUsed: false,
    });

    // TODO: In production, send actual email here
    // For development, log the OTP
    console.log(`[DEV] OTP for ${email} (${role}): ${otp}`);

    // In development, include OTP in response for testing
    // Remove this in production!
    const isDevelopment = process.env.NODE_ENV === 'development';

    return successResponse(
      isDevelopment ? { otp, expiresInMinutes: config.auth.otpExpiryMinutes } : null,
      'If an account exists with this email, an OTP has been sent.'
    );
  } catch (error) {
    console.error('POST /api/auth/send-otp error:', error);
    return errors.serverError('Failed to send OTP');
  }
}
