/**
 * Enhanced Roadmap Model with 5-Rule Priority System
 * 
 * Features from old system:
 * - Priority rules (CRITICAL/HIGH/MEDIUM/LOW)
 * - Category breakdown (required_gap, optional_gap, strengthen, rejected)
 * - Rule-based item generation (5 deterministic rules)
 * - Edge case detection (fully_ready, only_optional_gaps, etc.)
 * - Progress tracking with detailed breakdowns
 */

import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import type { SkillLevel } from '@/types';

// ============================================================================
// Types
// ============================================================================

export type StepType = 'learn' | 'practice' | 'validate' | 'master';
export type StepStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';
export type RoadmapStatus = 'active' | 'completed' | 'archived';
export type PriorityType = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type CategoryType = 'required_gap' | 'optional_gap' | 'strengthen' | 'rejected';
export type ConfidenceType = 'validated' | 'unvalidated' | 'rejected';
export type RuleType = 'RULE_1_REQUIRED_MISSING' | 'RULE_2_REJECTED' | 'RULE_3_UNVALIDATED_REQUIRED' | 'RULE_4_OPTIONAL_MISSING';

export interface IRoadmapStep {
  _id: Types.ObjectId;
  skillId: Types.ObjectId;
  skillName: string;
  stepType: StepType;
  importance: 'required' | 'optional';
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  levelsToImprove: number;
  priority: number;
  weight: number;
  status: StepStatus;
  startedAt?: Date;
  completedAt?: Date;
  estimatedHours: number;
  actionDescription: string;
  suggestedResources?: string[];
  userNotes?: string;
}

export interface IRoadmap {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  roleId: Types.ObjectId;
  readinessId: Types.ObjectId;
  
  // Roadmap metadata
  status: RoadmapStatus;
  title: string;
  description: string;
 
  // Progress summary
  totalSteps: number;
  completedSteps: number;
  progressPercentage: number;
  
  // Estimated totals
  totalEstimatedHours: number;
  completedHours: number;
  
  // Readiness context
  readinessAtGeneration: number;
  projectedReadiness: number;
  
  // Steps
  steps: IRoadmapStep[];
  
  // Priority breakdown (from old system)
  priorityBreakdown: {
    high: number;
    medium: number;
    low: number;
    critical: number;
  };
  
  // Category breakdown (from old system)
  categoryBreakdown: {
    required_gap: number;
    optional_gap: number;
    strengthen: number;
    rejected: number;
  };
  
  // Rule breakdown (from old system)
  ruleBreakdown: {
    rule_1_required_missing: number;
    rule_2_rejected: number;
    rule_3_unvalidated_required: number;
    rule_4_optional_missing: number;
  };
  
  // Edge case detection
  edgeCase: {
    is_fully_ready: boolean;
    only_optional_gaps: boolean;
    has_pending_validation: boolean;
    pending_validation_count: number;
    has_unvalidated_required: boolean;
    unvalidated_required_count: number;
    message: string;
    message_type: string;
  };
  
  // Timestamps
  generatedAt: Date;
  lastUpdatedAt: Date;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Document Interface
// ============================================================================

export interface IRoadmapDocument extends Omit<IRoadmap, '_id'>, Document {}

// ============================================================================
// Model Interface with Static Methods
// ============================================================================

interface IRoadmapModel extends Model<IRoadmapDocument> {
  getActiveForUser(
    userId: string | Types.ObjectId,
    roleId?: string | Types.ObjectId
  ): Promise<IRoadmapDocument | null>;
  
  archiveExisting(
    userId: string | Types.ObjectId,
    roleId: string | Types.ObjectId
  ): Promise<void>;
}

// ============================================================================
// Main Schema (Steps are embedded)
// ============================================================================

const RoadmapStepSchema = new Schema<IRoadmapStep>(
  {
    skillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    skillName: { type: String, required: true },
    stepType: {
      type: String,
      enum: ['learn', 'practice', 'validate', 'master'],
      required: true,
    },
    importance: {
      type: String,
      enum: ['required', 'optional'],
      required: true,
    },
    currentLevel: {
      type: String,
      enum: ['none', 'beginner', 'intermediate', 'advanced', 'expert'],
      required: true,
    },
    targetLevel: {
      type: String,
      enum: ['none', 'beginner', 'intermediate', 'advanced', 'expert'],
      required: true,
    },
    levelsToImprove: { type: Number, required: true, default: 0 },
    priority: { type: Number, required: true, min: 1, max: 5 },
    weight: { type: Number, required: true },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'skipped'],
      default: 'not_started',
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    estimatedHours: { type: Number, required: true, default: 0 },
    actionDescription: { type: String, required: true },
    suggestedResources: [{ type: String }],
    userNotes: { type: String },
  },
  { _id: true }
);

const RoadmapSchema = new Schema<IRoadmapDocument>(
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
    readinessId: {
      type: Schema.Types.ObjectId,
      ref: 'ReadinessSnapshot',
      required: [true, 'Readiness snapshot reference is required'],
    },
    
    // Roadmap metadata
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
    title: { type: String, required: true, default: 'Skill Development Roadmap' },
    description: { type: String, default: '' },
    
    // Progress summary
    totalSteps: { type: Number, default: 0 },
    completedSteps: { type: Number, default: 0 },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    
    // Estimated totals
    totalEstimatedHours: { type: Number, default: 0 },
    completedHours: { type: Number, default: 0 },
    
    // Readiness context
    readinessAtGeneration: { type: Number, default: 0, min: 0, max: 100 },
    projectedReadiness: { type: Number, default: 0, min: 0, max: 100 },
    
    // Steps
    steps: {
      type: [RoadmapStepSchema],
      default: [],
    },
    
    // Priority breakdown
    priorityBreakdown: {
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      critical: { type: Number, default: 0 }
    },
    
    // Category breakdown
    categoryBreakdown: {
      required_gap: { type: Number, default: 0 },
      optional_gap: { type: Number, default: 0 },
      strengthen: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 }
    },
    
    // Rule breakdown
    ruleBreakdown: {
      rule_1_required_missing: { type: Number, default: 0 },
      rule_2_rejected: { type: Number, default: 0 },
      rule_3_unvalidated_required: { type: Number, default: 0 },
      rule_4_optional_missing: { type: Number, default: 0 }
    },
    
    // Edge case detection
    edgeCase: {
      is_fully_ready: { type: Boolean, default: false },
      only_optional_gaps: { type: Boolean, default: false },
      has_pending_validation: { type: Boolean, default: false },
      pending_validation_count: { type: Number, default: 0 },
      has_unvalidated_required: { type: Boolean, default: false },
      unvalidated_required_count: { type: Number, default: 0 },
      message: { type: String, default: '' },
      message_type: { type: String, default: '' }
    },
    
    // Timestamps
    generatedAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now },
    archivedAt: { type: Date }
  },
  {
    timestamps: true,
  }
);

// ============================================================================
// Indexes
// ============================================================================

RoadmapSchema.index({ userId: 1, roleId: 1, status: 1 });

// ============================================================================
// Pre-save: Update progress calculations
// ============================================================================

RoadmapSchema.pre('save', function () {
  // Recalculate progress
  this.totalSteps = this.steps.length;
  this.completedSteps = this.steps.filter((s) => s.status === 'completed').length;
  this.progressPercentage = this.totalSteps > 0
    ? Math.round((this.completedSteps / this.totalSteps) * 100)
    : 0;
  
  // Calculate completed hours
  this.completedHours = this.steps
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + s.estimatedHours, 0);
  
  // Update lastUpdatedAt
  this.lastUpdatedAt = new Date();
  
  // Check if roadmap is completed
  if (this.completedSteps === this.totalSteps && this.totalSteps > 0 && this.status !== 'archived') {
    this.status = 'completed';
  }
});

// ============================================================================
// Static Methods
// ============================================================================

RoadmapSchema.statics.getActiveForUser = async function (
  userId: string | Types.ObjectId,
  roleId?: string | Types.ObjectId
): Promise<IRoadmapDocument | null> {
  const query: Record<string, unknown> = {
    userId,
    status: 'active',
  };
  
  if (roleId) {
    query.roleId = roleId;
  }
  
  return this.findOne(query)
    .populate('roleId', 'name description colorClass')
    .sort({ generatedAt: -1 })
    .exec();
};

RoadmapSchema.statics.archiveExisting = async function (
  userId: string | Types.ObjectId,
  roleId: string | Types.ObjectId
): Promise<void> {
  await this.updateMany(
    { userId, roleId, status: 'active' },
    { status: 'archived' }
  );
};

// ============================================================================
// Export
// ============================================================================

const Roadmap = (mongoose.models.Roadmap as IRoadmapModel) ||
  mongoose.model<IRoadmapDocument, IRoadmapModel>('Roadmap', RoadmapSchema);

export default Roadmap;
