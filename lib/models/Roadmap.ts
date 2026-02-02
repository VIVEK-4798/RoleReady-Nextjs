/**
 * Roadmap Model
 * 
 * A personalized learning roadmap generated from the user's readiness gaps.
 * 
 * Design Decisions:
 * 
 * 1. ROADMAP = PRIORITIZED PLAN: A roadmap is a snapshot of what the user needs
 *    to learn, ordered by priority. It's regenerated when readiness changes.
 * 
 * 2. STEPS ARE ACTIONABLE: Each step represents a concrete learning action:
 *    - Learn a new skill (missing)
 *    - Improve an existing skill (below required level)
 *    - Get skill validated (increase validation multiplier)
 * 
 * 3. PROGRESS TRACKING: Users can mark steps as in-progress or completed.
 *    Completed steps don't automatically update skills - that's done separately.
 * 
 * 4. LINKED TO TARGET ROLE: A roadmap is always for a specific target role.
 *    Changing target role should trigger roadmap regeneration.
 * 
 * 5. ESTIMATED EFFORT: Each step has an estimated time/effort based on the
 *    level jump required.
 */

import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import type { SkillLevel } from '@/types';

// ============================================================================
// Types
// ============================================================================

export type StepType = 'learn_new' | 'improve' | 'validate';
export type StepStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';
export type RoadmapStatus = 'active' | 'completed' | 'archived';

export interface IRoadmapStep {
  _id: Types.ObjectId;
  skillId: Types.ObjectId;
  skillName: string;
  stepType: StepType;
  importance: 'required' | 'optional';
  
  // Level progression
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  levelsToImprove: number;
  
  // Priority (from readiness gap calculation)
  priority: number;
  weight: number;
  
  // Progress
  status: StepStatus;
  startedAt?: Date;
  completedAt?: Date;
  
  // Estimated effort
  estimatedHours: number;
  
  // Action details
  actionDescription: string;
  suggestedResources: string[];
  
  // Notes
  userNotes?: string;
}

export interface IRoadmap {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  roleId: Types.ObjectId;
  
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
  
  // Steps
  steps: IRoadmapStep[];
  
  // Readiness context
  readinessAtGeneration: number; // Readiness % when roadmap was created
  projectedReadiness: number;    // Expected readiness after completing all steps
  
  // Timestamps
  generatedAt: Date;
  lastUpdatedAt: Date;
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
  /**
   * Get the active roadmap for a user's target role
   */
  getActiveForUser(
    userId: string | Types.ObjectId,
    roleId?: string | Types.ObjectId
  ): Promise<IRoadmapDocument | null>;
  
  /**
   * Archive existing roadmaps when a new one is generated
   */
  archiveExisting(
    userId: string | Types.ObjectId,
    roleId: string | Types.ObjectId
  ): Promise<void>;
}

// ============================================================================
// Step Sub-Schema
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
      enum: ['learn_new', 'improve', 'validate'] as StepType[],
      required: true,
    },
    importance: {
      type: String,
      enum: ['required', 'optional'],
      required: true,
    },
    
    // Level progression
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
    levelsToImprove: { type: Number, required: true, min: 0 },
    
    // Priority
    priority: { type: Number, required: true },
    weight: { type: Number, required: true, min: 1, max: 10 },
    
    // Progress
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'skipped'] as StepStatus[],
      default: 'not_started',
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    
    // Estimated effort
    estimatedHours: { type: Number, required: true, min: 0 },
    
    // Action details
    actionDescription: { type: String, required: true },
    suggestedResources: [{ type: String }],
    
    // Notes
    userNotes: { type: String, maxlength: 2000 },
  },
  { timestamps: false }
);

// ============================================================================
// Main Schema
// ============================================================================

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
    
    // Roadmap metadata
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'] as RoadmapStatus[],
      default: 'active',
    },
    title: { type: String, required: true },
    description: { type: String },
    
    // Progress summary
    totalSteps: { type: Number, required: true, default: 0 },
    completedSteps: { type: Number, required: true, default: 0 },
    progressPercentage: { type: Number, required: true, default: 0, min: 0, max: 100 },
    
    // Estimated totals
    totalEstimatedHours: { type: Number, required: true, default: 0 },
    completedHours: { type: Number, required: true, default: 0 },
    
    // Steps
    steps: {
      type: [RoadmapStepSchema],
      default: [],
    },
    
    // Readiness context
    readinessAtGeneration: { type: Number, required: true, min: 0, max: 100 },
    projectedReadiness: { type: Number, required: true, min: 0, max: 100 },
    
    // Timestamps
    generatedAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// ============================================================================
// Indexes
// ============================================================================

// Active roadmap for user + role
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
  if (this.completedSteps === this.totalSteps && this.totalSteps > 0) {
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
