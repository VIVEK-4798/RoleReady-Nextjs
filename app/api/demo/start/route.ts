/**
 * Demo Start API
 * 
 * POST /api/demo/start
 * Creates a new demo session for the landing page demo experience.
 * 
 * This is completely isolated from real user data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/db/mongoose';
import { DemoSession } from '@/lib/models';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Generate a unique session ID
    const sessionId = uuidv4();

    // Calculate expiry (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create demo session
    const session = await DemoSession.create({
      sessionId,
      expiresAt,
      demoSkills: [],
    });

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error('[Demo Start API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start demo session' },
      { status: 500 }
    );
  }
}
