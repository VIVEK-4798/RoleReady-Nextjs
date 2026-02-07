/**
 * Roadmap API Routes
 * 
 * GET  /api/users/[id]/roadmap - Get active roadmap
 * POST /api/users/[id]/roadmap - Generate new roadmap
 * 
 * Features:
 * - Get current active roadmap with all steps
 * - Generate new roadmap from readiness gaps
 * - Archives existing roadmap when generating new one
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';
import {
  getActiveRoadmap,
  generateAndSaveRoadmap,
} from '@/lib/services/roadmapService';
import { TargetRole } from '@/lib/models';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ============================================================================
// Helper: Format roadmap for API response
// ============================================================================

function formatRoadmapResponse(roadmap: Awaited<ReturnType<typeof getActiveRoadmap>>) {
  if (!roadmap) return null;
  
  return {
    id: roadmap._id.toString(),
    roleId: roadmap.roleId.toString(),
    roleName: roadmap.roleId && typeof roadmap.roleId === 'object' && 'name' in roadmap.roleId
      ? (roadmap.roleId as { name: string }).name
      : undefined,
    status: roadmap.status,
    title: roadmap.title,
    description: roadmap.description,
    
    // Progress
    totalSteps: roadmap.totalSteps,
    completedSteps: roadmap.completedSteps,
    progressPercentage: roadmap.progressPercentage,
    
    // Time estimates
    totalEstimatedHours: roadmap.totalEstimatedHours,
    completedHours: roadmap.completedHours,
    
    // Readiness projections
    readinessAtGeneration: roadmap.readinessAtGeneration,
    projectedReadiness: roadmap.projectedReadiness,
    
    // Steps
    steps: roadmap.steps.map((step) => ({
      id: step._id.toString(),
      skillId: step.skillId.toString(),
      skillName: step.skillName,
      stepType: step.stepType,
      importance: step.importance,
      currentLevel: step.currentLevel,
      targetLevel: step.targetLevel,
      levelsToImprove: step.levelsToImprove,
      priority: step.priority,
      weight: step.weight,
      status: step.status,
      startedAt: step.startedAt,
      completedAt: step.completedAt,
      estimatedHours: step.estimatedHours,
      actionDescription: step.actionDescription,
      suggestedResources: step.suggestedResources,
      userNotes: step.userNotes,
    })),
    
    // Timestamps
    generatedAt: roadmap.generatedAt,
    lastUpdatedAt: roadmap.lastUpdatedAt,
    createdAt: roadmap.createdAt,
  };
}

// ============================================================================
// GET /api/users/[id]/roadmap
// ============================================================================

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: userId } = await context.params;
    
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
    
    // Extract roleId safely
    let roleId: string;
    if (typeof targetRole.roleId === 'object' && targetRole.roleId !== null) {
      const populatedRoleId = targetRole.roleId as any;
      roleId = populatedRoleId._id ? populatedRoleId._id.toString() : populatedRoleId.toString();
    } else {
      roleId = String(targetRole.roleId);
    }
    
    // Get active roadmap
    const roadmap = await getActiveRoadmap(userId, roleId);
    
    return success({
      hasTargetRole: true,
      roleId: roleId,
      roadmap: formatRoadmapResponse(roadmap),
      message: roadmap 
        ? undefined 
        : 'No roadmap generated yet. Generate a roadmap to see your learning path.',
    });
  } catch (error) {
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
    
    // Auth check
    const session = await auth();
    if (!session?.user) {
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
      const targetRole = await TargetRole.getActiveForUser(userId);
      if (!targetRole) {
        return errors.badRequest('No target role selected. Select a target role first.');
      }
      
      // Extract roleId safely
      if (typeof targetRole.roleId === 'object' && targetRole.roleId !== null) {
        const populatedRoleId = targetRole.roleId as any;
        roleId = populatedRoleId._id ? populatedRoleId._id.toString() : populatedRoleId.toString();
      } else {
        roleId = String(targetRole.roleId);
      }
    }
    
    // Generate and save roadmap
    const roadmap = await generateAndSaveRoadmap({
      userId,
      roleId,
      maxSteps,
      archiveExisting: true,
    });
    
    // Populate role for response
    await roadmap.populate('roleId', 'name description colorClass');
    
    return success(
      { roadmap: formatRoadmapResponse(roadmap) },
      'Roadmap generated successfully',
      201
    );
  } catch (error) {
    return handleError(error);
  }
}
