/**
 * ReadinessSnapshot Model
 * 
 * Stores point-in-time snapshots of a user's readiness calculation.
 * 
 * Design Decisions:
 * 
 * 1. SNAPSHOTS, NOT LIVE DATA: Readiness is always calculated fresh, but we
 *    store snapshots for:
 *    - Historical tracking (progress over time)
 *    - Quick retrieval on dashboard (avoid recalculating every page load)
 *    - Role change history (what was their score when they left a role?)
 * 
 * 2. TRIGGER SOURCE: Each snapshot records why it was created:
 *    - 'role_change': User selected a new target role
 *    - 'skill_update': User's skills changed
 *    - 'validation': Mentor validated/rejected skills
 *    - 'manual': User explicitly clicked "recalculate"
 * 
 * 3. FULL BREAKDOWN STORED: We store the per-skill breakdown so users can
 *    see exactly how their score was derived without recalculating.
 * 
 * 4. LINKED TO TARGET ROLE: When a snapshot is created, we update the
 *    TargetRole.readinessAtChange field for the current active target role.
 * 
 * 5. NOT USER-EDITABLE: These are system-generated. Users cannot modify
 *    readiness scores directly.
 */

import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import type { SkillLevel, SkillSource, ValidationStatus } from '@/types';

// ============================================================================
// Types
// ============================================================================

export type SnapshotTrigger = 'role_change' | 'skill_update' | 'validation' | 'manual';

export interface ISkillBreakdown {
  skillId: Types.ObjectId;
  skillName: string;
  importance: 'required' | 'optional';
  weight: number;
  requiredLevel: SkillLevel;
  userLevel: SkillLevel;
  levelPoints: number;
  validationMultiplier: number;
  rawScore: number;
  weightedScore: number;
  maxPossibleScore: number;
  meetsRequirement: boolean;
  isMissing: boolean;
  source: SkillSource | null;
  validationStatus: ValidationStatus | null;
}

export interface IReadinessSnapshot {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  roleId: Types.ObjectId;
  
  // Summary scores
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  
  // Requirement status
  hasAllRequired: boolean;
  requiredSkillsMet: number;
  requiredSkillsTotal: number;
  
  // Breakdown counts
  totalBenchmarks: number;
  skillsMatched: number;
  skillsMissing: number;
  
  // Detailed breakdown
  breakdown: ISkillBreakdown[];
  
  // Trigger info
  trigger: SnapshotTrigger;
  triggerDetails?: string; // Optional context (e.g., "Switched from Frontend Developer")
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Document Interface
// ============================================================================

export interface IReadinessSnapshotDocument extends Omit<IReadinessSnapshot, '_id'>, Document {}

// ============================================================================
// Model Interface with Static Methods
// ============================================================================

interface IReadinessSnapshotModel extends Model<IReadinessSnapshotDocument> {
  /**
   * Get the latest snapshot for a user + role combination
   */
  getLatest(
    userId: string | Types.ObjectId,
    roleId: string | Types.ObjectId
  ): Promise<IReadinessSnapshotDocument | null>;
  
  /**
   * Get snapshot history for a user (optionally filtered by role)
   */
  getHistory(
    userId: string | Types.ObjectId,
    options?: {
      roleId?: string | Types.ObjectId;
      limit?: number;
    }
  ): Promise<IReadinessSnapshotDocument[]>;
}

// ============================================================================
// Sub-Schema for Skill Breakdown
// ============================================================================

const SkillBreakdownSchema = new Schema<ISkillBreakdown>(
  {
    skillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    skillName: { type: String, required: true },
    importance: {
      type: String,
      enum: ['required', 'optional'],
      required: true,
    },
    weight: { type: Number, required: true },
    requiredLevel: {
      type: String,
      enum: ['none', 'beginner', 'intermediate', 'advanced', 'expert'],
      required: true,
    },
    userLevel: {
      type: String,
      enum: ['none', 'beginner', 'intermediate', 'advanced', 'expert'],
      required: true,
    },
    levelPoints: { type: Number, required: true },
    validationMultiplier: { type: Number, required: true },
    rawScore: { type: Number, required: true },
    weightedScore: { type: Number, required: true },
    maxPossibleScore: { type: Number, required: true },
    meetsRequirement: { type: Boolean, required: true },
    isMissing: { type: Boolean, required: true },
    source: {
      type: String,
      enum: ['self', 'resume', 'validated', null],
      default: null,
    },
    validationStatus: {
      type: String,
      enum: ['none', 'pending', 'validated', 'rejected', null],
      default: null,
    },
  },
  { _id: false }
);

// ============================================================================
// Main Schema
// ============================================================================

const ReadinessSnapshotSchema = new Schema<IReadinessSnapshotDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Role reference is required'],
      index: true,
    },
    
    // Summary scores
    totalScore: { type: Number, required: true },
    maxPossibleScore: { type: Number, required: true },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    
    // Requirement status
    hasAllRequired: { type: Boolean, required: true },
    requiredSkillsMet: { type: Number, required: true, min: 0 },
    requiredSkillsTotal: { type: Number, required: true, min: 0 },
    
    // Breakdown counts
    totalBenchmarks: { type: Number, required: true, min: 0 },
    skillsMatched: { type: Number, required: true, min: 0 },
    skillsMissing: { type: Number, required: true, min: 0 },
    
    // Detailed breakdown
    breakdown: {
      type: [SkillBreakdownSchema],
      default: [],
    },
    
    // Trigger info
    trigger: {
      type: String,
      enum: {
        values: ['role_change', 'skill_update', 'validation', 'manual'] as SnapshotTrigger[],
        message: '{VALUE} is not a valid trigger',
      },
      required: [true, 'Trigger is required'],
    },
    triggerDetails: {
      type: String,
      maxlength: [500, 'Trigger details cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================================
// Indexes
// ============================================================================

// Get latest snapshot for user + role
ReadinessSnapshotSchema.index({ userId: 1, roleId: 1, createdAt: -1 });

// Get all snapshots for a user (history)
ReadinessSnapshotSchema.index({ userId: 1, createdAt: -1 });

// ============================================================================
// Static Methods
// ============================================================================

ReadinessSnapshotSchema.statics.getLatest = async function (
  userId: string | Types.ObjectId,
  roleId: string | Types.ObjectId
): Promise<IReadinessSnapshotDocument | null> {
  return this.findOne({ userId, roleId })
    .sort({ createdAt: -1 })
    .populate('roleId', 'name description colorClass')
    .exec();
};

ReadinessSnapshotSchema.statics.getHistory = async function (
  userId: string | Types.ObjectId,
  options?: {
    roleId?: string | Types.ObjectId;
    limit?: number;
  }
): Promise<IReadinessSnapshotDocument[]> {
  const query: Record<string, unknown> = { userId };
  
  if (options?.roleId) {
    query.roleId = options.roleId;
  }
  
  let historyQuery = this.find(query)
    .populate('roleId', 'name description colorClass')
    .sort({ createdAt: -1 });
  
  if (options?.limit) {
    historyQuery = historyQuery.limit(options.limit);
  }
  
  return historyQuery.exec();
};

// ============================================================================
// Export
// ============================================================================

const ReadinessSnapshot = (mongoose.models.ReadinessSnapshot as IReadinessSnapshotModel) ||
  mongoose.model<IReadinessSnapshotDocument, IReadinessSnapshotModel>(
    'ReadinessSnapshot',
    ReadinessSnapshotSchema
  );

export default ReadinessSnapshot;
