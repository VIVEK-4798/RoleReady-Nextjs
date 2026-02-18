/**
 * Roadmap API Routes
 * 
 * GET  /api/users/[id]/roadmap - Get active roadmap (auto-generates if none exists)
 * POST /api/users/[id]/roadmap - Force generate new roadmap
 * 
 * Features:
 * - Auto-generates roadmap on first GET if none exists
 * - Regenerates on GET ?refresh=true
 * - 5-rule priority system (HIGH/MEDIUM/LOW)
 * - Response format matches old project for frontend compatibility
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';
import {
  getActiveRoadmap,
  generateAndSaveRoadmap,
} from '@/lib/services/roadmapService';
import { TargetRole, ReadinessSnapshot } from '@/lib/models';
import type { GeneratedStep } from '@/lib/services/roadmapGenerator';

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
// Helper: Format roadmap response to match old project format
// ============================================================================

function formatRoadmapForFrontend(roadmap: any, roleName: string, readinessPercentage: number) {
  if (!roadmap) return null;

  const steps = roadmap.steps || [];

  // Map steps to old project's "items" format
  const items = steps.map((step: any, index: number) => ({
    skill_id: step.skillId?.toString(),
    skill_name: step.skillName,
    reason: step.actionDescription || '',
    priority: getPriorityLabel(step.priority),
    category: step.importance === 'required'
      ? (step.currentLevel === 'none' ? 'required_gap' : 'strengthen')
      : 'optional_gap',
    confidence: getConfidenceFromStep(step),
    priority_score: step.weight ? (step.priority === 1 ? 80 + step.weight * 5 : step.priority === 2 ? 50 + step.weight * 3 : 20 + step.weight * 2) : 0,
    rule_applied: getRuleFromStep(step),
    details: {
      current_level: step.currentLevel || 'none',
      target_level: step.targetLevel || 'intermediate',
      level_gap: step.levelsToImprove || 0,
      is_required: step.importance === 'required',
      weight: step.weight || 0,
      gap_points: step.weight || 0,
      skill_source: 'self',
      category_name: roleName,
      category_label: getCategoryLabel(step),
      category_emoji: getCategoryEmoji(step),
      priority_emoji: getPriorityEmoji(step.priority),
      confidence_label: 'Self-reported',
      action_hint: getActionHint(step),
    },
    rank: index + 1,
  }));

  // Count by priority
  const highItems = items.filter((i: any) => i.priority === 'HIGH');
  const mediumItems = items.filter((i: any) => i.priority === 'MEDIUM');
  const lowItems = items.filter((i: any) => i.priority === 'LOW');

  // Count by category
  const requiredGap = items.filter((i: any) => i.category === 'required_gap');
  const optionalGap = items.filter((i: any) => i.category === 'optional_gap');
  const strengthen = items.filter((i: any) => i.category === 'strengthen');
  const rejected = items.filter((i: any) => i.category === 'rejected');

  // Count by rule
  const rule1 = items.filter((i: any) => i.rule_applied === 'RULE_1_REQUIRED_MISSING');
  const rule2 = items.filter((i: any) => i.rule_applied === 'RULE_2_REJECTED');
  const rule3 = items.filter((i: any) => i.rule_applied === 'RULE_3_UNVALIDATED_REQUIRED');
  const rule4 = items.filter((i: any) => i.rule_applied === 'RULE_4_OPTIONAL_MISSING');

  // Count excluded (validated + met) from total benchmarks
  const totalSteps = steps.length;
  const excludedCount = roadmap.priorityBreakdown?.excluded || 0;

  return {
    readiness_id: roadmap.readinessId?.toString(),
    user_id: roadmap.userId?.toString(),
    role_id: roadmap.roleId?.toString(),
    role_name: roleName,
    current_score: readinessPercentage,
    generated_at: roadmap.generatedAt || roadmap.createdAt,
    items,
    summary: {
      total_items: items.length,
      by_priority: {
        high: highItems.length,
        medium: mediumItems.length,
        low: lowItems.length,
      },
      by_category: {
        rejected: rejected.length,
        required_gap: requiredGap.length,
        strengthen: strengthen.length,
        optional_gap: optionalGap.length,
      },
      by_rule: {
        rule_1_required_missing: rule1.length,
        rule_2_rejected: rule2.length,
        rule_3_unvalidated_required: rule3.length,
        rule_4_optional_missing: rule4.length,
      },
      needs_immediate_action: highItems.length,
      excluded_validated: excludedCount,
    },
    rules_applied: [
      { rule: 'RULE_1', description: 'Missing required skills → HIGH priority', count: rule1.length },
      { rule: 'RULE_2', description: 'Rejected skills → HIGH priority', count: rule2.length },
      { rule: 'RULE_3', description: 'Unvalidated required skills → MEDIUM priority', count: rule3.length },
      { rule: 'RULE_4', description: 'Optional missing skills → LOW priority', count: rule4.length },
      { rule: 'RULE_5', description: 'Validated & met skills → EXCLUDED', count: excludedCount },
    ],
    edge_case: roadmap.edgeCase || {
      is_fully_ready: items.length === 0,
      only_optional_gaps: highItems.length === 0 && mediumItems.length === 0 && lowItems.length > 0,
      has_pending_validation: false,
      pending_validation_count: 0,
      has_unvalidated_required: mediumItems.length > 0,
      unvalidated_required_count: mediumItems.length,
      message: items.length === 0 ? 'You are fully ready for this role!' : null,
      message_type: items.length === 0 ? 'success' : null,
    },
  };
}

function getPriorityLabel(priority: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (priority === 1) return 'HIGH';
  if (priority === 2) return 'MEDIUM';
  return 'LOW';
}

function getConfidenceFromStep(step: any): string {
  if (step.stepType === 'validate') return 'unvalidated';
  if (step.currentLevel === 'none') return 'unvalidated';
  return 'unvalidated';
}

function getRuleFromStep(step: any): string {
  // Determine rule based on step properties
  if (step.importance === 'required' && step.currentLevel === 'none') return 'RULE_1_REQUIRED_MISSING';
  if (step.stepType === 'validate' && step.importance === 'required') return 'RULE_3_UNVALIDATED_REQUIRED';
  if (step.importance === 'optional' && step.currentLevel === 'none') return 'RULE_4_OPTIONAL_MISSING';
  if (step.importance === 'required') return 'RULE_3_UNVALIDATED_REQUIRED';
  return 'RULE_4_OPTIONAL_MISSING';
}

function getCategoryLabel(step: any): string {
  if (step.importance === 'required' && step.currentLevel === 'none') return 'Required Gap';
  if (step.importance === 'optional') return 'Optional Gap';
  if (step.stepType === 'validate') return 'Needs Validation';
  return 'Strengthen';
}

function getCategoryEmoji(step: any): string {
  if (step.importance === 'required' && step.currentLevel === 'none') return '🔴';
  if (step.importance === 'optional') return '🟡';
  if (step.stepType === 'validate') return '🔵';
  return '🔵';
}

function getPriorityEmoji(priority: number): string {
  if (priority === 1) return '🔥';
  if (priority === 2) return '📈';
  return '📋';
}

function getActionHint(step: any): string {
  if (step.currentLevel === 'none' && step.importance === 'required') return 'Add this skill to your profile';
  if (step.currentLevel === 'none' && step.importance === 'optional') return 'Consider adding this skill to improve your readiness score';
  if (step.stepType === 'validate') return 'Request mentor validation for this skill';
  return 'Improve this skill to meet role requirements';
}

// ============================================================================
// GET /api/users/[id]/roadmap
// Auto-generates roadmap if none exists, regenerates on ?refresh=true
// ============================================================================

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: userId } = await context.params;
    const refresh = request.nextUrl.searchParams.get('refresh') === 'true';

    console.log('[Roadmap GET] userId:', userId, 'refresh:', refresh);

    // Auth check
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };

    // Authorization
    if (sessionUser.id !== userId && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only view your own roadmap');
    }

    await connectDB();

    // Check if user has a target role
    const targetRole = await TargetRole.getActiveForUser(userId);
    if (!targetRole) {
      return success({
        hasTargetRole: false,
        roadmap: null,
        message: 'No target role selected. Select a target role to generate a roadmap.',
      });
    }

    // Extract roleId and roleName
    const roleId = extractRoleId(targetRole);
    const roleName = (typeof targetRole.roleId === 'object' && targetRole.roleId !== null && 'name' in (targetRole.roleId as any))
      ? (targetRole.roleId as any).name
      : 'Your Target Role';

    console.log('[Roadmap GET] roleId:', roleId, 'roleName:', roleName);

    // Get existing roadmap
    let roadmap = await getActiveRoadmap(userId, roleId);

    // If no roadmap exists, try to generate one if a readiness snapshot exists
    if (!roadmap) {
      console.log('[Roadmap GET] No roadmap found. Checking for readiness snapshot...');

      // Check if readiness calculated
      const snapshot = await ReadinessSnapshot.getLatest(userId, roleId);

      if (snapshot) {
        // Auto-generate roadmap
        console.log('[Roadmap GET] Readiness snapshot found. Auto-generating roadmap...');
        try {
          roadmap = await generateAndSaveRoadmap({
            userId,
            roleId,
            archiveExisting: true,
          });
          console.log('[Roadmap GET] Roadmap auto-generated successfully.');
        } catch (genError) {
          console.error('[Roadmap GET] Failed to auto-generate roadmap:', genError);
          // Fallthrough to return null roadmap if generation fails
        }
      }

      // If still no roadmap (no snapshot or generation failed)
      if (!roadmap) {
        console.log('[Roadmap GET] No roadmap and no readiness found (or generation failed).');
        return success({
          hasTargetRole: true,
          roleId,
          roadmap: null,
          message: 'No roadmap generated yet. Please calculate your readiness first.',
          needsGeneration: true
        });
      }
    }

    // Get evaluation state
    const { getEvaluationState } = await import('@/lib/services/evaluationService');
    const evaluationState = await getEvaluationState(userId);
    const isOutdated = evaluationState?.roadmapOutdated || false;

    // Get readiness percentage
    let readinessPercentage = roadmap.readinessAtGeneration || 0;
    const snapshot = await ReadinessSnapshot.getLatest(userId, roleId);
    if (snapshot) {
      readinessPercentage = snapshot.percentage;
    }

    // Count excluded skills (total benchmarks - roadmap items)
    const excludedCount = snapshot?.breakdown
      ? snapshot.breakdown.filter((b: any) => !b.isMissing && b.validationStatus === 'validated').length
      : 0;

    // Format response to match old project
    const formattedRoadmap = formatRoadmapForFrontend(roadmap, roleName, readinessPercentage);
    if (formattedRoadmap) {
      formattedRoadmap.summary.excluded_validated = excludedCount;
      formattedRoadmap.rules_applied[4].count = excludedCount;
    }

    console.log('[Roadmap GET] Returning roadmap with', formattedRoadmap?.items?.length, 'items');

    return Response.json({
      success: true,
      message: `Generated roadmap with ${formattedRoadmap?.items?.length || 0} items`,
      roadmap: formattedRoadmap,
      isOutdated,
    });
  } catch (error) {
    console.error('[Roadmap GET] Error:', error);
    return handleError(error);
  }
}

// ============================================================================
// POST /api/users/[id]/roadmap
// ============================================================================

interface GenerateRoadmapBody {
  roleId?: string;
  maxSteps?: number;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: userId } = await context.params;
    console.log('[Roadmap POST] Starting roadmap generation for userId:', userId);

    // Auth check
    const session = await auth();
    if (!session?.user) {
      console.log('[Roadmap POST] Unauthorized - no session');
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };

    // Authorization
    if (sessionUser.id !== userId && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only generate your own roadmap');
    }

    await connectDB();

    // Parse body
    let roleId: string | undefined;
    let maxSteps: number | undefined;

    try {
      const body: GenerateRoadmapBody = await request.json();
      roleId = body.roleId;
      if (body.maxSteps && typeof body.maxSteps === 'number' && body.maxSteps > 0) {
        maxSteps = Math.min(body.maxSteps, 50); // Cap at 50 steps
      }
    } catch {
      // Empty body is fine, will use active target role
    }

    // If no roleId provided, check for active target role
    if (!roleId) {
      console.log('[Roadmap POST] No roleId provided, fetching active target role');
      const targetRole = await TargetRole.getActiveForUser(userId);
      if (!targetRole) {
        console.log('[Roadmap POST] No active target role found');
        return errors.badRequest('No target role selected. Select a target role first.');
      }

      // Extract roleId safely
      if (typeof targetRole.roleId === 'object' && targetRole.roleId !== null) {
        const populatedRoleId = targetRole.roleId as any;
        roleId = populatedRoleId._id ? populatedRoleId._id.toString() : populatedRoleId.toString();
      } else {
        roleId = String(targetRole.roleId);
      }
      console.log('[Roadmap POST] Extracted roleId:', roleId);
    }

    // Generate and save roadmap
    console.log('[Roadmap POST] Calling generateAndSaveRoadmap with:', { userId, roleId, maxSteps });
    const roadmap = await generateAndSaveRoadmap({
      userId,
      roleId,
      maxSteps,
      archiveExisting: true,
    });
    console.log('[Roadmap POST] Roadmap generated successfully, id:', roadmap._id);

    // Mark roadmap evaluation as complete
    const { markEvaluationComplete } = await import('@/lib/services/evaluationService');
    await markEvaluationComplete(userId, 'roadmap');

    // Populate role for response
    await roadmap.populate('roleId', 'name description colorClass');

    const populatedRole = roadmap.roleId as any;
    const roleName = populatedRole.name;
    const readinessPercentage = roadmap.readinessAtGeneration || 0;

    return success(
      { roadmap: formatRoadmapForFrontend(roadmap, roleName, readinessPercentage) },
      'Roadmap generated successfully',
      201
    );
  } catch (error) {
    return handleError(error);
  }
}
