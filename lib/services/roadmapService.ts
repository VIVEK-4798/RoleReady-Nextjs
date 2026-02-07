/**
 * Roadmap Service
 * 
 * Orchestrates roadmap generation and management:
 * 1. Fetches readiness data
 * 2. Calls the pure generator function
 * 3. Persists the roadmap
 * 4. Handles step updates
 */

import { Types } from 'mongoose';
import connectDB from '@/lib/db/mongoose';
import Roadmap, { type IRoadmapDocument, type StepStatus } from '@/lib/models/Roadmap';
import TargetRole from '@/lib/models/TargetRole';
import ReadinessSnapshot from '@/lib/models/ReadinessSnapshot';
import { calculateReadinessOnly } from './readinessService';
import { generateRoadmap, type GeneratedRoadmap } from './roadmapGenerator';

// ============================================================================
// Types
// ============================================================================

export interface GenerateRoadmapOptions {
  userId: string;
  roleId?: string; // If not provided, uses active target role
  maxSteps?: number;
  archiveExisting?: boolean; // Default: true
}

export interface UpdateStepOptions {
  userId: string;
  roadmapId: string;
  stepId: string;
  status: StepStatus;
  userNotes?: string;
}

// ============================================================================
// Generate Roadmap
// ============================================================================

/**
 * Generate and persist a new roadmap for the user
 */
export async function generateAndSaveRoadmap(
  options: GenerateRoadmapOptions
): Promise<IRoadmapDocument> {
  const { userId, maxSteps, archiveExisting = true } = options;
  let { roleId } = options;
  
  await connectDB();
  
  // If no roleId provided, get from active target role
  if (!roleId) {
    const targetRole = await TargetRole.getActiveForUser(userId);
    if (!targetRole) {
      throw new Error('No target role selected. Select a target role first.');
    }
    roleId = targetRole.roleId.toString();
  }
  
  // Get readiness data
  const readinessResult = await calculateReadinessOnly(userId, roleId);
  
  // Get or create readiness snapshot
  let snapshot = await ReadinessSnapshot.getLatest(userId, roleId);
  
  if (!snapshot) {
    // If no snapshot exists, create one
    snapshot = await ReadinessSnapshot.create({
      userId: new Types.ObjectId(userId),
      roleId: new Types.ObjectId(roleId),
      percentage: readinessResult.percentage,
      status: readinessResult.status,
      breakdown: readinessResult.breakdown,
      summary: readinessResult.summary,
      edge_case: readinessResult.edge_case,
    });
  }
  
  const readinessId = snapshot._id;
  
  // Generate roadmap (pure function)
  const generated: GeneratedRoadmap = generateRoadmap({
    userId,
    roleId,
    roleName: readinessResult.roleName,
    readinessResult,
    maxSteps,
  });
  
  // Archive existing roadmaps if requested
  if (archiveExisting) {
    await Roadmap.archiveExisting(userId, roleId);
  }
  
  // Convert generated steps to DB format
  const steps = generated.steps.map((step) => ({
    skillId: new Types.ObjectId(step.skillId),
    skillName: step.skillName,
    stepType: step.stepType,
    importance: step.importance,
    currentLevel: step.currentLevel,
    targetLevel: step.targetLevel,
    levelsToImprove: step.levelsToImprove,
    priority: step.priority,
    weight: step.weight,
    status: 'not_started' as StepStatus,
    estimatedHours: step.estimatedHours,
    actionDescription: step.actionDescription,
    suggestedResources: step.suggestedResources,
  }));
  
  // Create and save roadmap
  const roadmap = await Roadmap.create({
    userId: new Types.ObjectId(userId),
    roleId: new Types.ObjectId(roleId),
    readinessId: readinessId,
    status: 'active',
    title: generated.title,
    description: generated.description,
    steps,
    totalEstimatedHours: generated.totalEstimatedHours,
    readinessAtGeneration: generated.readinessAtGeneration,
    projectedReadiness: generated.projectedReadiness,
    generatedAt: new Date(),
  });
  
  return roadmap;
}

// ============================================================================
// Get Active Roadmap
// ============================================================================

/**
 * Get the user's active roadmap
 */
export async function getActiveRoadmap(
  userId: string,
  roleId?: string
): Promise<IRoadmapDocument | null> {
  await connectDB();
  return Roadmap.getActiveForUser(userId, roleId);
}

// ============================================================================
// Get Roadmap by ID
// ============================================================================

/**
 * Get a specific roadmap by ID
 */
export async function getRoadmapById(
  userId: string,
  roadmapId: string
): Promise<IRoadmapDocument | null> {
  await connectDB();
  
  return Roadmap.findOne({
    _id: roadmapId,
    userId,
  })
    .populate('roleId', 'name description colorClass')
    .exec();
}

// ============================================================================
// Get Roadmap History
// ============================================================================

/**
 * Get all roadmaps for a user (including archived)
 */
export async function getRoadmapHistory(
  userId: string,
  options?: { roleId?: string; limit?: number; includeArchived?: boolean }
): Promise<IRoadmapDocument[]> {
  await connectDB();
  
  const query: Record<string, unknown> = { userId };
  
  if (options?.roleId) {
    query.roleId = options.roleId;
  }
  
  if (!options?.includeArchived) {
    query.status = { $ne: 'archived' };
  }
  
  let historyQuery = Roadmap.find(query)
    .populate('roleId', 'name description colorClass')
    .sort({ generatedAt: -1 });
  
  if (options?.limit) {
    historyQuery = historyQuery.limit(options.limit);
  }
  
  return historyQuery.exec();
}

// ============================================================================
// Update Step Status
// ============================================================================

/**
 * Update a step's status within a roadmap
 */
export async function updateStepStatus(
  options: UpdateStepOptions
): Promise<IRoadmapDocument | null> {
  const { userId, roadmapId, stepId, status, userNotes } = options;
  
  await connectDB();
  
  const roadmap = await Roadmap.findOne({
    _id: roadmapId,
    userId,
    status: { $ne: 'archived' },
  });
  
  if (!roadmap) {
    return null;
  }
  
  // Find and update the step
  const step = roadmap.steps.find((s) => s._id.toString() === stepId);
  if (!step) {
    throw new Error(`Step not found: ${stepId}`);
  }
  
  // Update step status
  step.status = status;
  
  // Set timestamps based on status
  if (status === 'in_progress' && !step.startedAt) {
    step.startedAt = new Date();
  }
  
  if (status === 'completed' && !step.completedAt) {
    step.completedAt = new Date();
  }
  
  // Update notes if provided
  if (userNotes !== undefined) {
    step.userNotes = userNotes;
  }
  
  // Save roadmap (pre-save hook will recalculate progress)
  await roadmap.save();
  
  return roadmap;
}

// ============================================================================
// Bulk Update Steps
// ============================================================================

/**
 * Update multiple steps at once
 */
export async function bulkUpdateSteps(
  userId: string,
  roadmapId: string,
  updates: Array<{ stepId: string; status: StepStatus; userNotes?: string }>
): Promise<IRoadmapDocument | null> {
  await connectDB();
  
  const roadmap = await Roadmap.findOne({
    _id: roadmapId,
    userId,
    status: { $ne: 'archived' },
  });
  
  if (!roadmap) {
    return null;
  }
  
  // Apply all updates
  for (const update of updates) {
    const step = roadmap.steps.find((s) => s._id.toString() === update.stepId);
    if (step) {
      step.status = update.status;
      
      if (update.status === 'in_progress' && !step.startedAt) {
        step.startedAt = new Date();
      }
      
      if (update.status === 'completed' && !step.completedAt) {
        step.completedAt = new Date();
      }
      
      if (update.userNotes !== undefined) {
        step.userNotes = update.userNotes;
      }
    }
  }
  
  await roadmap.save();
  
  return roadmap;
}

// ============================================================================
// Archive Roadmap
// ============================================================================

/**
 * Archive a roadmap
 */
export async function archiveRoadmap(
  userId: string,
  roadmapId: string
): Promise<boolean> {
  await connectDB();
  
  const result = await Roadmap.updateOne(
    { _id: roadmapId, userId },
    { status: 'archived' }
  );
  
  return result.modifiedCount > 0;
}
