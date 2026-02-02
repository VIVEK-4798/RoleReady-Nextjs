/**
 * Signup API Route
 * 
 * POST /api/auth/signup
 * 
 * Creates a new user account and returns success.
 * Does NOT automatically sign in - user must login separately.
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';
import { successResponse, errors } from '@/lib/utils/api';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password, mobile, role = 'user' } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return errors.validationError('Name, email, and password are required');
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return errors.validationError('Please enter a valid email address');
    }

    // Validate password strength
    if (password.length < 6) {
      return errors.validationError('Password must be at least 6 characters');
    }

    // Validate role (only 'user' and 'mentor' allowed for self-registration)
    // Admins must be created separately via seed script
    if (role !== 'user' && role !== 'mentor') {
      return errors.forbidden('Only user and mentor accounts can be self-registered');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errors.conflict('An account with this email already exists');
    }

    // Create new user (password will be hashed by pre-save middleware)
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      mobile: mobile?.trim(),
      role, // Use the provided role (user or mentor)
      isActive: true,
      profile: {},
    });

    await user.save();

    // Return success (without sensitive data)
    return successResponse(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      'Account created successfully. Please login to continue.',
      201
    );
  } catch (error) {
    console.error('POST /api/auth/signup error:', error);

    if (error instanceof Error && error.name === 'ValidationError') {
      return errors.validationError(error.message);
    }

    return errors.serverError('Failed to create account');
  }
}
