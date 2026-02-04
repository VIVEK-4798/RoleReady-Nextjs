/**
 * ActivityLog Model
 * 
 * Tracks user and mentor activities for the contribution graph.
 * Each qualifying action creates one ActivityLog entry.
 * 
 * Design Decisions:
 * 
 * 1. SIMPLE STRUCTURE: Just userId, role, actionType, and timestamp
 *    - No weighting or scoring
 *    - Each entry = 1 contribution
 * 
 * 2. ACTION TYPES:
 *    User actions: skill_added, skill_updated, resume_uploaded, 
 *                  readiness_calculated, roadmap_step_completed, role_changed
 *    Mentor actions: skill_approved, skill_rejected, internship_added, job_added
 * 
 * 3. READ-ONLY AGGREGATION: This collection is optimized for:
 *    - Counting activities by date
 *    - Filtering by userId and role
 *    - Date range queries (past 365 days)
 * 
 * 4. SIDE-EFFECT ONLY: Activity logging should not affect business logic.
 *    If logging fails, the main operation should still succeed.
 */

import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ============================================================================
// Types
// ============================================================================

export type UserActionType = 
  | 'skill_added'
  | 'skill_updated'
  | 'resume_uploaded'
  | 'readiness_calculated'
  | 'roadmap_step_completed'
  | 'role_changed';

export type MentorActionType =
  | 'skill_approved'
  | 'skill_rejected'
  | 'internship_added'
  | 'job_added';

export type ActionType = UserActionType | MentorActionType;

export type ActivityRole = 'user' | 'mentor';

export interface IActivityLog {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  role: ActivityRole;
  actionType: ActionType;
  metadata?: Record<string, unknown>; // Optional context (e.g., skillId, jobId)
  createdAt: Date;
}

// ============================================================================
// Document Interface
// ============================================================================

export interface IActivityLogDocument extends Omit<IActivityLog, '_id'>, Document {}

// ============================================================================
// Model Interface with Static Methods
// ============================================================================

interface IActivityLogModel extends Model<IActivityLogDocument> {
  /**
   * Log an activity (fire-and-forget, should not throw)
   */
  logActivity(
    userId: string | Types.ObjectId,
    role: ActivityRole,
    actionType: ActionType,
    metadata?: Record<string, unknown>
  ): Promise<void>;

  /**
   * Get contributions for a user over a date range
   */
  getContributions(
    userId: string | Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, number>>;
}

// ============================================================================
// Schema
// ============================================================================

const ActivityLogSchema = new Schema<IActivityLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'mentor'] as ActivityRole[],
        message: '{VALUE} is not a valid role',
      },
      required: [true, 'Role is required'],
    },
    actionType: {
      type: String,
      enum: {
        values: [
          // User actions
          'skill_added',
          'skill_updated',
          'resume_uploaded',
          'readiness_calculated',
          'roadmap_step_completed',
          'role_changed',
          // Mentor actions
          'skill_approved',
          'skill_rejected',
          'internship_added',
          'job_added',
        ] as ActionType[],
        message: '{VALUE} is not a valid action type',
      },
      required: [true, 'Action type is required'],
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need createdAt
  }
);

// ============================================================================
// Indexes
// ============================================================================

// Efficient date-range queries for contribution graph
ActivityLogSchema.index({ userId: 1, createdAt: -1 });

// Combined index for filtering by role and date
ActivityLogSchema.index({ userId: 1, role: 1, createdAt: -1 });

// ============================================================================
// Static Methods
// ============================================================================

/**
 * Log an activity - fire-and-forget pattern
 * Errors are logged but not thrown to avoid affecting main operations
 */
ActivityLogSchema.statics.logActivity = async function (
  userId: string | Types.ObjectId,
  role: ActivityRole,
  actionType: ActionType,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await this.create({
      userId: typeof userId === 'string' ? new Types.ObjectId(userId) : userId,
      role,
      actionType,
      metadata,
    });
  } catch (error) {
    // Log but don't throw - activity logging is a side effect
    console.error('Failed to log activity:', error);
  }
};

/**
 * Get contributions grouped by date for contribution graph
 */
ActivityLogSchema.statics.getContributions = async function (
  userId: string | Types.ObjectId,
  startDate: Date,
  endDate: Date
): Promise<Record<string, number>> {
  const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

  const result = await this.aggregate([
    {
      $match: {
        userId: userObjectId,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Convert to object format
  const contributions: Record<string, number> = {};
  for (const item of result) {
    contributions[item._id] = item.count;
  }

  return contributions;
};

// ============================================================================
// Model Export
// ============================================================================

const ActivityLog = (mongoose.models.ActivityLog as IActivityLogModel) ||
  mongoose.model<IActivityLogDocument, IActivityLogModel>('ActivityLog', ActivityLogSchema);

export default ActivityLog;
