/**
 * Readiness API Route
 * GET  /api/users/[id]/readiness - Get latest readiness snapshot
 * POST /api/users/[id]/readiness - Trigger recalculation
 * 
 * Features:
 * - Returns latest snapshot with skill breakdown
 * - POST triggers fresh calculation and creates new snapshot
 * - Resolves readiness_outdated notifications on recalculate
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { TargetRole, ActivityLog } from '@/lib/models';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';
import {
  calculateAndSnapshot,
  getLatestSnapshot,
  calculateReadinessOnly,
} from '@/lib/services/readinessService';
import type { SnapshotTrigger } from '@/lib/models/ReadinessSnapshot';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ============================================================================
// Helper: Extract roleId safely from TargetRole
// ============================================================================

function extractRoleId(targetRole: any): string {
  if (typeof targetRole.roleId === 'object' && targetRole.roleId !== null) {
    const populated = targetRole.roleId as any;
    return populated._id ? populated._id.toString() : populated.toString();
  }
  return String(targetRole.roleId);
}

// ============================================================================
// Helper: Format snapshot for API response
// ============================================================================

function formatSnapshotResponse(snapshot: Awaited<ReturnType<typeof getLatestSnapshot>>) {
  if (!snapshot) return null;

  return {
    id: snapshot._id.toString(),
    roleId: snapshot.roleId.toString(),
    totalScore: snapshot.totalScore,
    maxPossibleScore: snapshot.maxPossibleScore,
    percentage: snapshot.percentage,
    hasAllRequired: snapshot.hasAllRequired,
    requiredSkillsMet: snapshot.requiredSkillsMet,
    requiredSkillsTotal: snapshot.requiredSkillsTotal,
    totalBenchmarks: snapshot.totalBenchmarks,
    skillsMatched: snapshot.skillsMatched,
    skillsMissing: snapshot.skillsMissing,
    trigger: snapshot.trigger,
    triggerDetails: snapshot.triggerDetails,
    createdAt: snapshot.createdAt,
    breakdown: snapshot.breakdown.map((b) => ({
      skillId: b.skillId.toString(),
      skillName: b.skillName,
      importance: b.importance,
      weight: b.weight,
      requiredLevel: b.requiredLevel,
      userLevel: b.userLevel,
      levelPoints: b.levelPoints,
      validationMultiplier: b.validationMultiplier,
      rawScore: b.rawScore,
      weightedScore: b.weightedScore,
      maxPossibleScore: b.maxPossibleScore,
      meetsRequirement: b.meetsRequirement,
      isMissing: b.isMissing,
      source: b.source,
      validationStatus: b.validationStatus,
    })),
  };
}

// ============================================================================
// GET /api/users/[id]/readiness
// ============================================================================

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: userId } = await context.params;

    // 1. Auth check
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };

    // 2. Authorization: Users can only view their own readiness
    if (sessionUser.id !== userId && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only view your own readiness');
    }

    await connectDB();

    // 3. Get user's active target role
    const targetRole = await TargetRole.getActiveForUser(userId);
    if (!targetRole) {
      return success({
        hasTargetRole: false,
        snapshot: null,
        message: 'No target role selected. Select a target role to see readiness.',
      });
    }

    // 4. Get latest snapshot
    const snapshot = await getLatestSnapshot(userId, extractRoleId(targetRole));

    // 5. Check if fresh calculation is needed via query param
    const searchParams = request.nextUrl.searchParams;
    const preview = searchParams.get('preview') === 'true';

    if (preview && !snapshot) {
      // Calculate without persisting (preview mode)
      const previewResult = await calculateReadinessOnly(
        userId,
        extractRoleId(targetRole)
      );

      return success({
        hasTargetRole: true,
        roleId: extractRoleId(targetRole),
        snapshot: null,
        preview: {
          percentage: previewResult.percentage,
          hasAllRequired: previewResult.hasAllRequired,
          requiredSkillsMet: previewResult.requiredSkillsMet,
          requiredSkillsTotal: previewResult.requiredSkillsTotal,
          gaps: previewResult.gaps,
        },
        message: 'No snapshot yet. Showing preview calculation.',
      });
    }

    // Get evaluation state
    const { getEvaluationState } = await import('@/lib/services/evaluationService');
    const evaluationState = await getEvaluationState(userId);
    const isOutdated = evaluationState?.readinessOutdated || false;

    return success({
      hasTargetRole: true,
      roleId: extractRoleId(targetRole),
      roleName: targetRole.roleId && typeof targetRole.roleId === 'object' && 'name' in targetRole.roleId
        ? (targetRole.roleId as { name: string }).name
        : undefined,
      snapshot: formatSnapshotResponse(snapshot),
      readinessAtChange: targetRole.readinessAtChange,
      isOutdated,
    });
  } catch (error) {
    return handleError(error);
  }
}

// ============================================================================
// POST /api/users/[id]/readiness
// ============================================================================

interface RecalculateBody {
  trigger?: SnapshotTrigger;
  triggerDetails?: string;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: userId } = await context.params;

    // 1. Auth check
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };

    // 2. Authorization
    if (sessionUser.id !== userId && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only recalculate your own readiness');
    }

    await connectDB();

    // 3. Get user's active target role
    const targetRole = await TargetRole.getActiveForUser(userId);
    if (!targetRole) {
      return errors.badRequest('No target role selected. Select a target role first.');
    }

    // 4. Parse body for trigger info
    let trigger: SnapshotTrigger = 'manual';
    let triggerDetails: string | undefined;

    try {
      const body: RecalculateBody = await request.json();
      if (body.trigger && ['role_change', 'skill_update', 'validation', 'manual'].includes(body.trigger)) {
        trigger = body.trigger;
      }
      if (body.triggerDetails && typeof body.triggerDetails === 'string') {
        triggerDetails = body.triggerDetails.slice(0, 500);
      }
    } catch {
      // Empty body is fine, use defaults
    }

    // 5. Calculate and save snapshot
    // 5. Calculate and save snapshot
    const result = await calculateAndSnapshot({
      userId,
      roleId: extractRoleId(targetRole),
      trigger,
      triggerDetails,
    });

    // Mark readiness evaluation as complete
    const { markEvaluationComplete } = await import('@/lib/services/evaluationService');
    await markEvaluationComplete(userId, 'readiness');

    // Log activity for contribution graph
    await ActivityLog.logActivity(userId, 'user', 'readiness_calculated', {
      roleId: extractRoleId(targetRole),
      percentage: result.snapshot.percentage,
      trigger,
    });

    // Trigger roadmap generation (async, non-blocking)
    import('@/lib/services/roadmapService').then(({ generateAndSaveRoadmap }) => {
      console.log('[Readiness API] Triggering async roadmap generation...');
      generateAndSaveRoadmap({
        userId,
        roleId: extractRoleId(targetRole),
        archiveExisting: true,
      }).catch(err => console.error('[Readiness API] Async roadmap generation failed:', err));
    }).catch(err => console.error('[Readiness API] Roadmap service import failed:', err));

    // Trigger readiness emails (async, non-blocking)
    const roleId = extractRoleId(targetRole);
    const roleName = targetRole.roleId && typeof targetRole.roleId === 'object' && 'name' in targetRole.roleId
      ? (targetRole.roleId as { name: string }).name
      : 'Unknown Role';
    const currentScore = result.snapshot.percentage;

    // Import ReadinessSnapshot to check for previous snapshots
    import('@/lib/models').then(async ({ ReadinessSnapshot }) => {
      // Get previous snapshot (skip 1 to get the one before current)
      const previousSnapshot = await ReadinessSnapshot.findOne({
        userId,
        roleId,
        isActive: true,
      }).sort({ createdAt: -1 }).skip(1).lean();

      const { triggerEmailEvent } = await import('@/lib/email/emailEventService');

      if (!previousSnapshot) {
        // First readiness calculation
        triggerEmailEvent({
          userId,
          event: 'READINESS_FIRST',
          metadata: {
            score: currentScore,
            roleName: roleName,
            roleId: roleId,
          },
        }).catch(err => console.error('[Readiness] First readiness email failed:', err));
      } else {
        // Check for major improvement (15% or more)
        const improvement = currentScore - previousSnapshot.percentage;

        if (improvement >= 15) {
          triggerEmailEvent({
            userId,
            event: 'READINESS_MAJOR_IMPROVEMENT',
            metadata: {
              oldScore: previousSnapshot.percentage,
              newScore: currentScore,
              roleName: roleName,
              roleId: roleId,
            },
          }).catch(err => console.error('[Readiness] Improvement email failed:', err));
        }
      }
    }).catch(err => console.error('[Readiness] Email module import failed:', err));

    return success({
      snapshot: result.snapshot,
      gaps: result.gaps,
    }, 'Readiness recalculated successfully');
  } catch (error) {
    return handleError(error);
  }
}
