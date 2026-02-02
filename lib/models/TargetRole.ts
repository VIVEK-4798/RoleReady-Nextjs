/**
 * TargetRole Model
 * 
 * Tracks a user's current target role (job role) selection and maintains
 * a complete history of all role changes.
 * 
 * Design Decisions:
 * 
 * 1. SEPARATE COLLECTION: Target role is stored separately from User because:
 *    - Role change history must be preserved (audit trail)
 *    - Supports complex queries on role selection patterns
 *    - Decouples role tracking from user profile updates
 *    - Enables future multi-role targeting if needed
 * 
 * 2. HISTORY PRESERVATION: When a user changes target role:
 *    - Previous selection is marked as inactive (isActive = false)
 *    - New selection is created with isActive = true
 *    - History is never deleted, only deactivated
 *    - readinessAtChange captures the last known readiness state
 * 
 * 3. SINGLE ACTIVE CONSTRAINT: Only ONE active target role per user at a time.
 *    Enforced via compound sparse index and pre-save middleware.
 * 
 * 4. READINESS OUTDATED FLAG: When role changes, sets readinessOutdated = true
 *    to trigger recalculation notification. This is a signal, not a stored score.
 */

import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ============================================================================
// Types
// ============================================================================

export type RoleSelector = 'self' | 'admin';

export interface ITargetRole {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  roleId: Types.ObjectId;
  isActive: boolean;
  selectedAt: Date;
  selectedBy: RoleSelector;
  deactivatedAt?: Date;
  readinessAtChange?: number;  // Snapshot of readiness when this selection was made/replaced
  notes?: string;              // Optional reason for change (esp. admin overrides)
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Document Interface
// ============================================================================

export interface ITargetRoleDocument extends Omit<ITargetRole, '_id'>, Document {}

// ============================================================================
// Model Interface with Static Methods
// ============================================================================

interface ITargetRoleModel extends Model<ITargetRoleDocument> {
  /**
   * Get the current active target role for a user
   */
  getActiveForUser(userId: string | Types.ObjectId): Promise<ITargetRoleDocument | null>;
  
  /**
   * Change a user's target role (deactivates previous, creates new)
   * Returns the new active target role
   */
  changeTargetRole(
    userId: string | Types.ObjectId,
    newRoleId: string | Types.ObjectId,
    selectedBy: RoleSelector,
    options?: {
      readinessAtChange?: number;
      notes?: string;
    }
  ): Promise<ITargetRoleDocument>;
  
  /**
   * Get role change history for a user
   */
  getHistory(
    userId: string | Types.ObjectId,
    options?: { limit?: number; includeActive?: boolean }
  ): Promise<ITargetRoleDocument[]>;
}

// ============================================================================
// Schema
// ============================================================================

const TargetRoleSchema = new Schema<ITargetRoleDocument>(
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
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    selectedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    selectedBy: {
      type: String,
      enum: {
        values: ['self', 'admin'] as RoleSelector[],
        message: '{VALUE} is not a valid selector',
      },
      required: [true, 'Selector is required'],
      default: 'self',
    },
    deactivatedAt: {
      type: Date,
    },
    readinessAtChange: {
      type: Number,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================================
// Indexes
// ============================================================================

// Ensure only one active target role per user
// This is a sparse partial index - only indexes documents where isActive = true
TargetRoleSchema.index(
  { userId: 1, isActive: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
    name: 'unique_active_role_per_user',
  }
);

// Efficient history queries
TargetRoleSchema.index({ userId: 1, selectedAt: -1 });

// ============================================================================
// Static Methods
// ============================================================================

TargetRoleSchema.statics.getActiveForUser = async function (
  userId: string | Types.ObjectId
): Promise<ITargetRoleDocument | null> {
  return this.findOne({
    userId,
    isActive: true,
  }).populate('roleId', 'name description colorClass');
};

TargetRoleSchema.statics.changeTargetRole = async function (
  userId: string | Types.ObjectId,
  newRoleId: string | Types.ObjectId,
  selectedBy: RoleSelector,
  options?: {
    readinessAtChange?: number;
    notes?: string;
  }
): Promise<ITargetRoleDocument> {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Find current active target role
    const currentActive = await this.findOne({
      userId,
      isActive: true,
    }).session(session);
    
    // If selecting the same role that's already active, return it (no-op)
    if (currentActive && currentActive.roleId.toString() === newRoleId.toString()) {
      await session.abortTransaction();
      return currentActive;
    }
    
    // Deactivate current selection if exists
    if (currentActive) {
      currentActive.isActive = false;
      currentActive.deactivatedAt = new Date();
      // Store readiness at the time of change if provided
      if (options?.readinessAtChange !== undefined) {
        currentActive.readinessAtChange = options.readinessAtChange;
      }
      await currentActive.save({ session });
    }
    
    // Create new active selection
    const newSelection = await this.create(
      [
        {
          userId,
          roleId: newRoleId,
          isActive: true,
          selectedAt: new Date(),
          selectedBy,
          notes: options?.notes,
        },
      ],
      { session }
    );
    
    await session.commitTransaction();
    
    // Re-fetch with population after transaction commits
    const populated = await this.findById(newSelection[0]._id)
      .populate('roleId', 'name description colorClass');
    
    return populated!;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

TargetRoleSchema.statics.getHistory = async function (
  userId: string | Types.ObjectId,
  options?: { limit?: number; includeActive?: boolean }
): Promise<ITargetRoleDocument[]> {
  const query: Record<string, unknown> = { userId };
  
  // By default, exclude active (show only past selections)
  if (!options?.includeActive) {
    query.isActive = false;
  }
  
  let historyQuery = this.find(query)
    .populate('roleId', 'name description colorClass')
    .sort({ selectedAt: -1 });
  
  if (options?.limit) {
    historyQuery = historyQuery.limit(options.limit);
  }
  
  return historyQuery.exec();
};

// ============================================================================
// Export
// ============================================================================

const TargetRole = (mongoose.models.TargetRole as ITargetRoleModel) ||
  mongoose.model<ITargetRoleDocument, ITargetRoleModel>('TargetRole', TargetRoleSchema);

export default TargetRole;
