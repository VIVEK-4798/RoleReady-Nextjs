/**
 * Readiness Service
 * 
 * Orchestrates the readiness calculation workflow:
 * 1. Fetches required data from DB (role benchmarks, user skills)
 * 2. Calls the pure calculation function
 * 3. Persists the snapshot
 * 4. Updates related documents (TargetRole)
 * 5. Resolves notifications
 * 
 * This is the ONLY place that combines DB operations with readiness logic.
 * The actual calculation remains pure in readinessCalculator.ts.
 */

import { Types } from 'mongoose';
import connectDB from '@/lib/db/mongoose';
import Role from '@/lib/models/Role';
import UserSkill from '@/lib/models/UserSkill';
import Skill from '@/lib/models/Skill';
import ReadinessSnapshot, { type SnapshotTrigger, type ISkillBreakdown } from '@/lib/models/ReadinessSnapshot';
import TargetRole from '@/lib/models/TargetRole';
import Notification from '@/lib/models/Notification';
import {
  calculateReadiness,
  getSkillGaps,
  type BenchmarkInput,
  type UserSkillInput,
  type ReadinessResult,
} from './readinessCalculator';
import type { SkillLevel, SkillSource, ValidationStatus } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface CalculateAndSnapshotOptions {
  userId: string;
  roleId: string;
  trigger: SnapshotTrigger;
  triggerDetails?: string;
  skipNotificationResolution?: boolean; // For testing
}

export interface CalculateAndSnapshotResult {
  snapshot: {
    id: string;
    totalScore: number;
    maxPossibleScore: number;
    percentage: number;
    hasAllRequired: boolean;
    requiredSkillsMet: number;
    requiredSkillsTotal: number;
    totalBenchmarks: number;
    skillsMatched: number;
    skillsMissing: number;
    trigger: SnapshotTrigger;
    createdAt: Date;
  };
  gaps: ReturnType<typeof getSkillGaps>;
}

// ============================================================================
// Helper: Fetch benchmarks from Role
// ============================================================================

async function fetchBenchmarks(roleId: string): Promise<{
  roleName: string;
  benchmarks: BenchmarkInput[];
} | null> {
  await connectDB();
  
  const role = await Role.findById(roleId)
    .populate({
      path: 'benchmarks.skillId',
      model: 'Skill',
      select: 'name category',
    })
    .lean()
    .exec();
  
  if (!role) {
    return null;
  }
  
  const benchmarks: BenchmarkInput[] = [];
  
  for (const benchmark of role.benchmarks || []) {
    // Skip inactive benchmarks
    if (!benchmark.isActive) continue;
    
    // Skip if skill reference is missing or not populated
    const skill = benchmark.skillId as unknown as { _id: Types.ObjectId; name: string } | null;
    if (!skill || typeof skill === 'string' || !('name' in skill)) continue;
    
    benchmarks.push({
      skillId: skill._id.toString(),
      skillName: skill.name,
      importance: benchmark.importance,
      weight: benchmark.weight,
      requiredLevel: benchmark.requiredLevel as SkillLevel,
    });
  }
  
  return {
    roleName: role.name,
    benchmarks,
  };
}

// ============================================================================
// Helper: Fetch user skills
// ============================================================================

async function fetchUserSkills(userId: string): Promise<UserSkillInput[]> {
  await connectDB();
  
  const userSkills = await UserSkill.find({
    userId: new Types.ObjectId(userId),
    isActive: true,
  })
    .populate({
      path: 'skillId',
      model: 'Skill',
      select: 'name',
    })
    .lean()
    .exec();
  
  const result: UserSkillInput[] = [];
  
  for (const us of userSkills) {
    const skill = us.skillId as unknown as { _id: Types.ObjectId; name: string } | null;
    if (!skill || typeof skill === 'string' || !('name' in skill)) continue;
    
    result.push({
      skillId: skill._id.toString(),
      skillName: skill.name,
      level: us.level as SkillLevel,
      source: us.source as SkillSource,
      validationStatus: us.validationStatus as ValidationStatus,
    });
  }
  
  return result;
}

// ============================================================================
// Main Service: Calculate and Persist Snapshot
// ============================================================================

/**
 * Calculate readiness and persist a snapshot.
 * 
 * This function:
 * 1. Fetches role benchmarks and user skills from DB
 * 2. Calls the pure calculation function
 * 3. Saves a snapshot document
 * 4. Updates TargetRole.readinessAtChange if applicable
 * 5. Resolves any readiness_outdated notifications
 * 
 * @throws Error if role not found or user has no target role
 */
export async function calculateAndSnapshot(
  options: CalculateAndSnapshotOptions
): Promise<CalculateAndSnapshotResult> {
  const { userId, roleId, trigger, triggerDetails, skipNotificationResolution } = options;
  
  await connectDB();
  
  // 1. Fetch benchmarks
  const roleData = await fetchBenchmarks(roleId);
  if (!roleData) {
    throw new Error(`Role not found: ${roleId}`);
  }
  
  // 2. Fetch user skills
  const userSkills = await fetchUserSkills(userId);
  
  // 3. Calculate readiness (PURE FUNCTION - no side effects)
  const result: ReadinessResult = calculateReadiness(
    userId,
    roleId,
    roleData.roleName,
    roleData.benchmarks,
    userSkills
  );
  
  // 4. Convert breakdown to DB schema format
  const breakdownForDb: ISkillBreakdown[] = result.breakdown.map((b) => ({
    skillId: new Types.ObjectId(b.skillId),
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
  }));
  
  // 5. Create snapshot
  const snapshot = await ReadinessSnapshot.create({
    userId: new Types.ObjectId(userId),
    roleId: new Types.ObjectId(roleId),
    totalScore: result.totalScore,
    maxPossibleScore: result.maxPossibleScore,
    percentage: result.percentage,
    hasAllRequired: result.hasAllRequired,
    requiredSkillsMet: result.requiredSkillsMet,
    requiredSkillsTotal: result.requiredSkillsTotal,
    totalBenchmarks: result.breakdown.length,
    skillsMatched: result.breakdown.filter((b) => !b.isMissing).length,
    skillsMissing: result.breakdown.filter((b) => b.isMissing).length,
    breakdown: breakdownForDb,
    trigger,
    triggerDetails,
  });
  
  // 6. Update TargetRole.readinessAtChange if this is for the active target role
  const targetRole = await TargetRole.getActiveForUser(userId);
  if (targetRole && targetRole.roleId.toString() === roleId) {
    targetRole.readinessAtChange = result.percentage;
    await targetRole.save();
  }
  
  // 7. Resolve readiness_outdated notifications
  if (!skipNotificationResolution) {
    await Notification.updateMany(
      {
        userId: new Types.ObjectId(userId),
        type: 'readiness_outdated',
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );
  }
  
  // 8. Get skill gaps for response
  const gaps = getSkillGaps(result);
  
  return {
    snapshot: {
      id: snapshot._id.toString(),
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
      createdAt: snapshot.createdAt,
    },
    gaps,
  };
}

// ============================================================================
// Quick Calculate (No Snapshot)
// ============================================================================

/**
 * Calculate readiness without persisting a snapshot.
 * Useful for preview/estimation purposes.
 */
export async function calculateReadinessOnly(
  userId: string,
  roleId: string
): Promise<ReadinessResult & { gaps: ReturnType<typeof getSkillGaps> }> {
  await connectDB();
  
  const roleData = await fetchBenchmarks(roleId);
  if (!roleData) {
    throw new Error(`Role not found: ${roleId}`);
  }
  
  const userSkills = await fetchUserSkills(userId);
  
  const result = calculateReadiness(
    userId,
    roleId,
    roleData.roleName,
    roleData.benchmarks,
    userSkills
  );
  
  return {
    ...result,
    gaps: getSkillGaps(result),
  };
}

// ============================================================================
// Get Latest Snapshot
// ============================================================================

/**
 * Get the latest readiness snapshot for a user's target role.
 * Returns null if no snapshot exists.
 */
export async function getLatestSnapshot(userId: string, roleId: string) {
  await connectDB();
  return ReadinessSnapshot.getLatest(userId, roleId);
}

// ============================================================================
// Get Snapshot History
// ============================================================================

/**
 * Get readiness snapshot history for a user.
 */
export async function getSnapshotHistory(
  userId: string,
  options?: { roleId?: string; limit?: number }
) {
  await connectDB();
  return ReadinessSnapshot.getHistory(userId, options);
}

// ============================================================================
// Recalculate for Active Target Role
// ============================================================================

/**
 * Recalculate readiness for the user's current active target role.
 * Creates a new snapshot with the specified trigger.
 */
export async function recalculateForActiveRole(
  userId: string,
  trigger: SnapshotTrigger = 'manual',
  triggerDetails?: string
): Promise<CalculateAndSnapshotResult | null> {
  await connectDB();
  
  const targetRole = await TargetRole.getActiveForUser(userId);
  if (!targetRole) {
    return null;
  }
  
  return calculateAndSnapshot({
    userId,
    roleId: targetRole.roleId.toString(),
    trigger,
    triggerDetails,
  });
}
