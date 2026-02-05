/**
 * Demo Calculate API
 * 
 * POST /api/demo/calculate
 * Calculates demo readiness score based on session skills.
 * 
 * This is completely isolated from real user data.
 * Does NOT write to ReadinessSnapshot collection.
 * 
 * Uses simplified readiness logic for the demo:
 * - Skills user has = "met"
 * - Skills user doesn't have = "missing"
 * - Score = (skills met / total skills required) × 100
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { DemoSession, Skill, Role } from '@/lib/models';

interface RequestBody {
  sessionId: string;
  roleId: string;
}

interface BreakdownItem {
  skillId: string;
  skillName: string;
  status: 'met' | 'missing';
  weight: number;
  isRequired: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { sessionId, roleId } = body;

    // Validate required fields
    if (!sessionId || !roleId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: sessionId, roleId' },
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

    // Get all skills for this role (skills that have this role in their roles array)
    const roleSkills = await Skill.find({ roles: roleId }).select('_id name');
    
    // Define a simple skill type for processing
    interface SimpleSkill {
      _id: string;
      name: string;
      weight: number;
      isRequired: boolean;
    }
    
    // Convert to simple skill format
    let requiredSkills: SimpleSkill[] = roleSkills.map(s => ({
      _id: s._id.toString(),
      name: s.name,
      weight: 1,
      isRequired: true,
    }));
    
    // If no skills found for role, try fetching skills associated with the role differently
    if (requiredSkills.length === 0) {
      // Fallback: get role and its benchmarks if available
      const role = await Role.findById(roleId).populate('benchmarks.skillId');
      if (role?.benchmarks && role.benchmarks.length > 0) {
        requiredSkills = role.benchmarks.map((b: unknown) => {
          const benchmark = b as { skillId: { _id: { toString(): string }; name: string }; weight?: number; importance?: string };
          return {
            _id: benchmark.skillId._id.toString(),
            name: benchmark.skillId.name,
            weight: benchmark.weight || 1,
            isRequired: benchmark.importance === 'required',
          };
        });
      }
    }

    // Get user's demo skills (skill IDs they selected)
    const userSkillIds = new Set(session.demoSkills.map(s => s.skillId));

    // Calculate breakdown
    const breakdown: BreakdownItem[] = [];
    let skillsMet = 0;
    let skillsMissing = 0;
    let totalScore = 0;
    let maxPossibleScore = 0;
    const missingRequiredSkills: string[] = [];

    for (const skill of requiredSkills) {
      const skillId = skill._id;
      const skillName = skill.name;
      const weight = skill.weight;
      const isRequired = skill.isRequired;
      const isMet = userSkillIds.has(skillId);

      breakdown.push({
        skillId,
        skillName,
        status: isMet ? 'met' : 'missing',
        weight,
        isRequired,
      });

      // Calculate score
      const skillMaxScore = 100 * weight;
      maxPossibleScore += skillMaxScore;

      if (isMet) {
        skillsMet++;
        // Assume intermediate level (50 points) for demo
        totalScore += 50 * weight;
      } else {
        skillsMissing++;
        if (isRequired) {
          missingRequiredSkills.push(skillName);
        }
      }
    }

    // Calculate percentage
    const percentage = maxPossibleScore > 0 
      ? Math.round((totalScore / maxPossibleScore) * 100) 
      : 0;

    // Update session with result
    session.demoReadinessScore = percentage;
    session.demoBreakdown = breakdown.map(b => ({
      skillId: b.skillId,
      skillName: b.skillName,
      status: b.status,
      weight: b.weight,
    }));
    await session.save();

    return NextResponse.json({
      success: true,
      data: {
        percentage,
        totalScore,
        maxPossibleScore,
        skillsMet,
        skillsMissing,
        breakdown: breakdown.map(b => ({
          skillId: b.skillId,
          skillName: b.skillName,
          status: b.status,
          weight: b.weight,
        })),
        missingRequiredSkills,
        roleName: session.selectedRoleName,
      },
    });
  } catch (error) {
    console.error('[Demo Calculate API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate demo readiness' },
      { status: 500 }
    );
  }
}
