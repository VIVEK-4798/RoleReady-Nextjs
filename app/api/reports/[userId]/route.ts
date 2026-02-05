/**
 * User Report API Route
 * GET /api/reports/[userId] - Get readiness report for a specific user
 * 
 * This endpoint generates a comprehensive report matching the old API format:
 * - User info
 * - Readiness summary (percentage, status, calculated_at)
 * - Skill breakdown (met_skills, missing_skills)
 * - Validation status
 * - Roadmap priorities
 * - History (last 3 snapshots)
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User, TargetRole, ReadinessSnapshot, Roadmap, Role } from '@/lib/models';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ userId: string }>;
}

// Get status label and color from percentage
function getStatusInfo(percentage: number) {
  if (percentage >= 70) {
    return { label: 'Ready', color: 'success' };
  } else if (percentage >= 40) {
    return { label: 'Partially Ready', color: 'warning' };
  } else {
    return { label: 'Not Ready', color: 'danger' };
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await context.params;
    
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    
    // Authorization: Users can only view their own report
    if (sessionUser.id !== userId && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only view your own report');
    }
    
    await connectDB();
    
    // Get user
    const user = await User.findById(userId).lean();
    if (!user) {
      return errors.notFound('User not found');
    }
    
    // Get active target role
    const targetRole = await TargetRole.findOne({
      userId,
      status: 'active',
    }).populate('roleId', 'name description colorClass benchmarks').lean();
    
    if (!targetRole) {
      return Response.json({
        success: false,
        error: 'NO_READINESS',
        message: 'No target role selected. Please select a target role first.',
      }, { status: 400 });
    }
    
    // Get the roleId safely
    const roleIdObj = targetRole.roleId as any;
    const roleId = (roleIdObj._id || roleIdObj).toString();
    const roleName = roleIdObj.name || 'Unknown';
    
    // Get latest snapshot
    const latestSnapshot = await ReadinessSnapshot.findOne({
      userId,
      roleId,
    }).sort({ createdAt: -1 }).lean();
    
    if (!latestSnapshot) {
      return Response.json({
        success: false,
        error: 'NO_READINESS',
        message: 'No readiness data found. Please calculate your readiness first.',
      }, { status: 400 });
    }
    
    // Get last 3 snapshots for history
    const historySnapshots = await ReadinessSnapshot.find({
      userId,
      roleId,
    }).sort({ createdAt: -1 }).limit(3).lean();
    
    // Get active roadmap
    const roadmap = await Roadmap.findOne({
      userId,
      roleId,
      status: 'active',
    }).lean();
    
    // Process skill breakdown from snapshot
    const breakdown = latestSnapshot.breakdown || [];
    
    const metSkills = breakdown
      .filter((b: any) => !b.isMissing)
      .map((b: any) => ({
        skill_id: b.skillId.toString(),
        skill_name: b.skillName,
        source: b.source,
        importance: b.importance,
        weight: b.weight,
        is_validated: b.validationStatus === 'validated',
      }));
    
    const missingSkills = breakdown
      .filter((b: any) => b.isMissing)
      .map((b: any) => ({
        skill_id: b.skillId.toString(),
        skill_name: b.skillName,
        source: null,
        importance: b.importance,
        weight: b.weight,
        is_validated: false,
      }));
    
    // Count pending validations (skills waiting for mentor review)
    const pendingValidationCount = breakdown.filter(
      (b: any) => b.validationStatus === 'pending'
    ).length;
    
    // Build history
    const history = historySnapshots.map((snap: {
      percentage: number;
      createdAt: Date;
    }) => {
      const statusInfo = getStatusInfo(snap.percentage);
      return {
        percentage: snap.percentage,
        status_label: statusInfo.label,
        status_color: statusInfo.color,
        calculated_at: snap.createdAt,
      };
    });
    
    // Build roadmap summary
    let roadmapSummary = null;
    if (roadmap) {
      const steps = (roadmap.steps || []) as Array<{
        priority: number;
        skillName: string;
        actionDescription?: string;
      }>;
      
      const highPriority = steps.filter(s => s.priority === 1);
      const mediumPriority = steps.filter(s => s.priority === 2);
      const lowPriority = steps.filter(s => s.priority === 3);
      
      roadmapSummary = {
        by_priority: {
          high: highPriority.length,
          medium: mediumPriority.length,
          low: lowPriority.length,
        },
        high_priority_items: highPriority.slice(0, 3).map(s => ({
          skill_name: s.skillName,
          reason: s.actionDescription || 'Required skill missing or needs improvement',
        })),
      };
    }
    
    // Build status info
    const statusInfo = getStatusInfo(latestSnapshot.percentage);
    
    // Build the report response
    const reportResponse = {
      success: true,
      generated_at: new Date().toISOString(),
      report: {
        user: {
          name: (user as { name: string }).name,
          target_role: {
            category_name: roleName,
          },
        },
        readiness: {
          percentage: latestSnapshot.percentage,
          status_label: statusInfo.label,
          status_color: statusInfo.color,
          calculated_at: latestSnapshot.createdAt,
        },
        skill_breakdown: {
          met_count: metSkills.length,
          missing_count: missingSkills.length,
          total_skills: breakdown.length,
          met_skills: metSkills,
          missing_skills: missingSkills,
        },
        validation: {
          pending_validation: pendingValidationCount,
        },
        roadmap: roadmapSummary,
        history,
      },
    };
    
    return Response.json(reportResponse);
  } catch (error) {
    console.error('[Report API] Error:', error);
    return handleError(error);
  }
}
