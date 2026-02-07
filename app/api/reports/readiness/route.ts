/**
 * Readiness Report API
 * 
 * GET /api/reports/readiness - Get full readiness report data
 * 
 * This endpoint aggregates data from:
 * - ReadinessSnapshot (latest for current target role)
 * - Roadmap (current active roadmap)
 * - User profile
 * - Target role info
 * 
 * RULES:
 * - Read-only, no mutations
 * - Uses existing snapshot data only
 * - Does NOT recalculate readiness
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User, TargetRole, ReadinessSnapshot, Roadmap, Role } from '@/lib/models';
import { successResponse, errors } from '@/lib/utils/api';
import { requireAuthApi } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  try {
    const { user: authUser, error } = await requireAuthApi();
    if (error || !authUser) return error || errors.unauthorized();

    await connectDB();

    // Get user profile
    const user = await User.findById(authUser.id).lean();
    if (!user) {
      return errors.notFound('User not found');
    }

    // Get current active target role
    const targetRole = await TargetRole.findOne({
      userId: authUser.id,
      isActive: true,
    })
      .populate('roleId', 'name description colorClass')
      .lean();

    if (!targetRole) {
      return errors.badRequest('No active target role set. Please select a target role first.');
    }

    // Get the latest readiness snapshot for this role
    const snapshot = await ReadinessSnapshot.findOne({
      userId: authUser.id,
      roleId: targetRole.roleId._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!snapshot) {
      return errors.notFound('No readiness snapshot found. Please calculate your readiness first.');
    }

    // Get the active roadmap for this role
    const roadmap = await Roadmap.findOne({
      userId: authUser.id,
      roleId: targetRole.roleId._id,
      status: 'active',
    }).lean();

    // Transform role data
    const roleData = targetRole.roleId as any;

    // Build the report
    const report = {
      // Report metadata
      generatedAt: new Date().toISOString(),
      snapshotDate: snapshot.createdAt,

      // User info
      user: {
        name: user.name,
        email: user.email,
      },

      // Role info
      role: {
        id: roleData._id.toString(),
        name: roleData.name,
        description: roleData.description || '',
        colorClass: roleData.colorClass || 'bg-blue-500',
      },

      // Readiness summary
      readiness: {
        score: snapshot.totalScore,
        maxScore: snapshot.maxPossibleScore,
        percentage: snapshot.percentage,
        hasAllRequired: snapshot.hasAllRequired,
        requiredSkillsMet: snapshot.requiredSkillsMet,
        requiredSkillsTotal: snapshot.requiredSkillsTotal,
        skillsMatched: snapshot.skillsMatched,
        skillsMissing: snapshot.skillsMissing,
        totalBenchmarks: snapshot.totalBenchmarks,
      },

      // Skill breakdown
      skills: snapshot.breakdown.map((skill: any) => ({
        id: skill.skillId.toString(),
        name: skill.skillName,
        importance: skill.importance,
        weight: skill.weight,
        requiredLevel: skill.requiredLevel,
        userLevel: skill.userLevel,
        meetsRequirement: skill.meetsRequirement,
        isMissing: skill.isMissing,
        source: skill.source,
        validationStatus: skill.validationStatus,
        weightedScore: skill.weightedScore,
        maxPossibleScore: skill.maxPossibleScore,
        scorePercentage: skill.maxPossibleScore > 0 
          ? Math.round((skill.weightedScore / skill.maxPossibleScore) * 100) 
          : 0,
      })),

      // Roadmap summary (if exists)
      roadmap: roadmap ? {
        id: roadmap._id.toString(),
        title: roadmap.title,
        status: roadmap.status,
        totalSteps: roadmap.totalSteps,
        completedSteps: roadmap.completedSteps,
        progressPercentage: roadmap.progressPercentage,
        totalEstimatedHours: roadmap.totalEstimatedHours,
        completedHours: roadmap.completedHours,
        readinessAtGeneration: roadmap.readinessAtGeneration,
        projectedReadiness: roadmap.projectedReadiness,
        steps: roadmap.steps.slice(0, 10).map((step: any) => ({
          id: step._id.toString(),
          skillName: step.skillName,
          stepType: step.stepType,
          importance: step.importance,
          currentLevel: step.currentLevel,
          targetLevel: step.targetLevel,
          status: step.status,
          priority: step.priority,
          estimatedHours: step.estimatedHours,
          actionDescription: step.actionDescription,
        })),
        hasMoreSteps: roadmap.steps.length > 10,
        remainingSteps: Math.max(0, roadmap.steps.length - 10),
      } : null,
    };

    return successResponse(report, 'Readiness report generated successfully');
  } catch (err) {
    console.error('Error generating readiness report:', err);
    return errors.serverError('Failed to generate readiness report');
  }
}
