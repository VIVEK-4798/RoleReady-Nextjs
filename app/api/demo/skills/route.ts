/**
 * Demo Skills API
 * 
 * POST /api/demo/skills
 * Adds/updates demo skills in the session.
 * 
 * This is completely isolated from real user data.
 * Does NOT write to UserSkill collection.
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { DemoSession, Skill, Role } from '@/lib/models';

interface RequestBody {
  sessionId: string;
  skillIds: string[];
  roleId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { sessionId, skillIds, roleId } = body;

    // Validate required fields
    if (!sessionId || !skillIds || !Array.isArray(skillIds) || !roleId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: sessionId, skillIds, roleId' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the demo session
    const session = await DemoSession.findOne({
      sessionId,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Demo session not found or expired' },
        { status: 404 }
      );
    }

    // Fetch skill details
    const skills = await Skill.find({ _id: { $in: skillIds } }).select('_id name domain');

    // Fetch role details
    const role = await Role.findById(roleId).select('name');

    // Update session with skills
    session.selectedRole = roleId;
    session.selectedRoleName = role?.name || 'Unknown Role';
    session.demoSkills = skills.map(skill => ({
      skillId: skill._id.toString(),
      skillName: skill.name,
      level: 'intermediate',
    }));

    await session.save();

    return NextResponse.json({
      success: true,
      message: 'Demo skills saved',
      data: {
        sessionId: session.sessionId,
        selectedRole: session.selectedRole,
        selectedRoleName: session.selectedRoleName,
        skillCount: session.demoSkills.length,
      },
    });
  } catch (error) {
    console.error('[Demo Skills API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save demo skills' },
      { status: 500 }
    );
  }
}
