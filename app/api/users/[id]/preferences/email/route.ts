/**
 * API Route: Email Preferences
 * GET/PUT /api/users/[id]/preferences/email
 * 
 * Manage user email notification preferences.
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import User from '@/lib/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = params.id;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Return email preferences (with defaults if not set)
    const preferences = user.emailPreferences || {
      skillReminders: true,
      roadmapUpdates: true,
      weeklyReports: true,
      mentorMessages: true,
      systemAnnouncements: true,
      marketingEmails: false,
    };

    return NextResponse.json({
      success: true,
      preferences,
    });

  } catch (error) {
    console.error('Error fetching email preferences:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { preferences } = await request.json();
    const userId = params.id;

    if (!preferences) {
      return NextResponse.json(
        { success: false, message: 'Preferences data is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Update email preferences
    user.emailPreferences = preferences;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Email preferences updated successfully',
      preferences: user.emailPreferences,
    });

  } catch (error) {
    console.error('Error updating email preferences:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
