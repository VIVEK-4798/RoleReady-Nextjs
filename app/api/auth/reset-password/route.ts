/**
 * Reset Password API Route
 * 
 * POST /api/auth/reset-password
 * 
 * Resets a user's password after OTP verification.
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';
import Otp from '@/lib/models/Otp';
import { successResponse, errors } from '@/lib/utils/api';
import { isValidObjectId } from '@/lib/utils/db';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, role = 'user', resetToken, newPassword } = body;

    // Validate required fields
    if (!email || !resetToken || !newPassword) {
      return errors.validationError('Email, reset token, and new password are required');
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return errors.validationError('Password must be at least 6 characters');
    }

    // Validate reset token format
    if (!isValidObjectId(resetToken)) {
      return errors.badRequest('Invalid reset token');
    }

    // Find the used OTP record (serves as our reset token)
    const otpRecord = await Otp.findOne({
      _id: resetToken,
      email: email.toLowerCase(),
      role,
      purpose: 'password-reset',
      isUsed: true,
    });

    if (!otpRecord) {
      return errors.badRequest('Invalid or expired reset token');
    }

    // Check if the OTP was used within the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (otpRecord.updatedAt < fifteenMinutesAgo) {
      return errors.badRequest('Reset token has expired. Please request a new OTP.');
    }

    // Find and update user's password
    const user = await User.findOne({
      email: email.toLowerCase(),
      role,
      isActive: true,
    });

    if (!user) {
      return errors.notFound('User');
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    // Delete the OTP record
    await Otp.deleteOne({ _id: resetToken });

    return successResponse(null, 'Password reset successfully. Please login with your new password.');
  } catch (error) {
    console.error('POST /api/auth/reset-password error:', error);
    return errors.serverError('Failed to reset password');
  }
}
