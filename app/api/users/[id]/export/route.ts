/**
 * API Route: Export User Data
 * POST /api/users/[id]/export
 * 
 * Export all user data in JSON format (GDPR compliance).
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import UserSkill from '@/lib/models/UserSkill';
import Roadmap from '@/lib/models/Roadmap';
import ReadinessSnapshot from '@/lib/models/ReadinessSnapshot';
import { Resume } from '@/lib/models/Resume';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const userId = params.id;

    // Fetch all user data
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const userSkills = await UserSkill.find({ userId: userId }).populate('skillId');
    const roadmaps = await Roadmap.find({ userId: userId });
    const readinessSnapshots = await ReadinessSnapshot.find({ userId: userId });
    const resumes = await Resume.find({ userId: userId });

    // Compile all data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        emailPreferences: user.emailPreferences,
        privacySettings: user.privacySettings,
      },
      skills: userSkills.map(skill => {
        const populatedSkill = skill.skillId as any;
        return {
          skill_name: populatedSkill?.name || 'Unknown',
          domain: populatedSkill?.domain || 'Unknown',
          level: skill.level,
          source: skill.source,
          addedAt: skill.createdAt,
        };
      }),
      roadmaps: roadmaps.map(roadmap => ({
        roleId: roadmap.roleId,
        title: roadmap.title,
        description: roadmap.description,
        status: roadmap.status,
        totalSteps: roadmap.totalSteps,
        completedSteps: roadmap.completedSteps,
        progressPercentage: roadmap.progressPercentage,
        createdAt: roadmap.createdAt,
      })),
      readinessSnapshots: readinessSnapshots.map(snapshot => ({
        roleId: snapshot.roleId,
        percentage: snapshot.percentage,
        hasAllRequired: snapshot.hasAllRequired,
        requiredSkillsMet: snapshot.requiredSkillsMet,
        requiredSkillsTotal: snapshot.requiredSkillsTotal,
        createdAt: snapshot.createdAt,
      })),
      resumes: resumes.map(resume => ({
        filename: resume.filename,
        originalName: resume.originalName,
        mimeType: resume.mimeType,
        status: resume.status,
        uploadedAt: resume.createdAt,
        skillsSynced: resume.skillsSynced,
      })),
      metadata: {
        totalSkills: userSkills.length,
        totalRoadmaps: roadmaps.length,
        totalSnapshots: readinessSnapshots.length,
        totalResumes: resumes.length,
      },
    };

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="roleready-data-${userId}-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });

  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to export data' },
      { status: 500 }
    );
  }
}
