/**
 * Roadmap Steps API Routes
 * 
 * PATCH /api/users/[id]/roadmap/steps/[stepId] - Update step status
 * 
 * Features:
 * - Mark steps as in_progress, completed, or skipped
 * - Add user notes to steps
 * - Auto-tracks start and completion times
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';
import { updateStepStatus, getActiveRoadmap } from '@/lib/services/roadmapService';
import { ActivityLog } from '@/lib/models';
import type { StepStatus } from '@/lib/models/Roadmap';

interface RouteContext {
  params: Promise<{ id: string; stepId: string }>;
}

// Valid step statuses
const VALID_STATUSES: StepStatus[] = ['not_started', 'in_progress', 'completed', 'skipped'];

// ============================================================================
// PATCH /api/users/[id]/roadmap/steps/[stepId]
// ============================================================================

interface UpdateStepBody {
  status?: StepStatus;
  userNotes?: string;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id: userId, stepId } = await context.params;
    
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    
    // Authorization
    if (sessionUser.id !== userId && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only update your own roadmap steps');
    }
    
    await connectDB();
    
    // Get active roadmap
    const roadmap = await getActiveRoadmap(userId);
    if (!roadmap) {
      return errors.notFound('No active roadmap found');
    }
    
    // Parse body
    const body: UpdateStepBody = await request.json();
    
    // Validate status if provided
    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return errors.badRequest(
        `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      );
    }
    
    // Must provide either status or userNotes
    if (!body.status && body.userNotes === undefined) {
      return errors.badRequest('Provide status and/or userNotes to update');
    }
    
    // Update the step
    const updatedRoadmap = await updateStepStatus({
      userId,
      roadmapId: roadmap._id.toString(),
      stepId,
      status: body.status || 'not_started',
      userNotes: body.userNotes,
    });
    
    if (!updatedRoadmap) {
      return errors.notFound('Step not found');
    }
    
    // Find the updated step for response
    const updatedStep = updatedRoadmap.steps.find((s) => s._id.toString() === stepId);

    // Log activity for contribution graph when step is completed
    if (body.status === 'completed' && updatedStep) {
      await ActivityLog.logActivity(userId, 'user', 'roadmap_step_completed', {
        stepId,
        skillName: updatedStep.skillName,
        roadmapId: roadmap._id.toString(),
      });
    }
    
    return success({
      step: updatedStep ? {
        id: updatedStep._id.toString(),
        skillId: updatedStep.skillId.toString(),
        skillName: updatedStep.skillName,
        status: updatedStep.status,
        startedAt: updatedStep.startedAt,
        completedAt: updatedStep.completedAt,
        userNotes: updatedStep.userNotes,
      } : null,
      roadmapProgress: {
        totalSteps: updatedRoadmap.totalSteps,
        completedSteps: updatedRoadmap.completedSteps,
        progressPercentage: updatedRoadmap.progressPercentage,
        completedHours: updatedRoadmap.completedHours,
        status: updatedRoadmap.status,
      },
    }, 'Step updated successfully');
  } catch (error) {
    return handleError(error);
  }
}
