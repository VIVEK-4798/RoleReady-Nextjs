/**
 * API Route: Privacy Settings
 * GET/PUT /api/users/[id]/preferences/privacy
 * 
 * Manage user privacy and profile visibility settings.
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

    // Return privacy settings (with defaults if not set)
    const settings = user.privacySettings || {
      profileVisibility: 'public',
      showEmail: false,
      showSkills: true,
      showProgress: true,
      allowMentorRequests: true,
      showInSearch: true,
    };

    return NextResponse.json({
      success: true,
      settings,
    });

  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
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

    const { settings } = await request.json();
    const userId = params.id;

    if (!settings) {
      return NextResponse.json(
        { success: false, message: 'Settings data is required' },
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

    // Update privacy settings
    user.privacySettings = settings;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Privacy settings updated successfully',
      settings: user.privacySettings,
    });

  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
