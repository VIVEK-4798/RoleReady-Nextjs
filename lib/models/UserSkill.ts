/**
 * UserSkill Model
 * 
 * Design Decisions:
 * 
 * 1. SEPARATE COLLECTION: User skills are stored separately from the User document because:
 *    - Skills have complex validation lifecycle (pending → validated → rejected)
 *    - Skills are queried independently for readiness calculation
 *    - Skills can have many-to-many relationships with mentor validations
 *    - Historical skill tracking would bloat the User document
 * 
 * 2. SOURCE TRACKING: Tracks where the skill came from:
 *    - 'self': User manually added the skill
 *    - 'resume': Extracted from resume parsing
 *    - 'validated': Originally self/resume, then validated by mentor
 * 
 * 3. VALIDATION WORKFLOW: Full audit trail for mentor validation:
 *    - validationStatus: Current state (none → pending → validated/rejected)
 *    - validatedBy: Reference to the mentor who validated
 *    - validatedAt: When validation occurred
 *    - validationNote: Mentor's feedback
 * 
 * 4. SKILL LEVEL: User's self-assessed or validated proficiency level.
 *    This is compared against the role's requiredLevel in readiness calculation.
 * 
 * 5. UNIQUE CONSTRAINT: One entry per user-skill pair. If user claims a skill
 *    again, we update rather than create duplicate.
 */

import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import type { IUserSkill, SkillSource, ValidationStatus, SkillLevel } from '@/types';

// ============================================================================
// UserSkill Document Interface
// ============================================================================

export interface IUserSkillDocument extends Omit<IUserSkill, '_id'>, Document {}

// ============================================================================
// UserSkill Schema
// ============================================================================

const UserSkillSchema = new Schema<IUserSkillDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    skillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill reference is required'],
    },
    level: {
      type: String,
      enum: {
        values: ['none', 'beginner', 'intermediate', 'advanced', 'expert'] as SkillLevel[],
        message: '{VALUE} is not a valid skill level',
      },
      default: 'beginner',
    },
    source: {
      type: String,
      enum: {
        values: ['self', 'resume', 'validated'] as SkillSource[],
        message: '{VALUE} is not a valid source',
      },
      required: [true, 'Source is required'],
      default: 'self',
    },
    validationStatus: {
      type: String,
      enum: {
        values: ['none', 'pending', 'validated', 'rejected'] as ValidationStatus[],
        message: '{VALUE} is not a valid validation status',
      },
      default: 'none',
    },
    validatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    validatedAt: {
      type: Date,
    },
    validationNote: {
      type: String,
      maxlength: [500, 'Validation note cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ============================================================================
// Indexes
// ============================================================================

// Unique constraint: one skill per user
UserSkillSchema.index({ userId: 1, skillId: 1 }, { unique: true });

// For fetching all skills for a user (readiness calculation)
UserSkillSchema.index({ userId: 1, source: 1 });

// For mentor validation queue (pending validations)
UserSkillSchema.index({ validationStatus: 1, source: 1 });

// For tracking validations by mentor
UserSkillSchema.index({ validatedBy: 1, validatedAt: -1 });

// ============================================================================
// Virtuals
// ============================================================================

/**
 * Check if this skill is validated
 */
UserSkillSchema.virtual('isValidated').get(function () {
  return this.validationStatus === 'validated';
});

/**
 * Check if this skill is pending validation
 */
UserSkillSchema.virtual('isPending').get(function () {
  return this.validationStatus === 'pending';
});

/**
 * Check if this skill was rejected
 */
UserSkillSchema.virtual('isRejected').get(function () {
  return this.validationStatus === 'rejected';
});

// ============================================================================
// Static Methods
// ============================================================================

interface UserSkillModel extends Model<IUserSkillDocument> {
  getValidatedSkillsForUser(userId: Types.ObjectId): Promise<IUserSkillDocument[]>;
  getPendingValidationQueue(mentorId?: Types.ObjectId): Promise<IUserSkillDocument[]>;
  getSkillCountsBySource(userId: Types.ObjectId): Promise<Record<SkillSource, number>>;
}

/**
 * Get all validated skills for a user
 * Used in readiness calculation with validation bonus
 */
UserSkillSchema.statics.getValidatedSkillsForUser = function (
  userId: Types.ObjectId
) {
  return this.find({
    userId,
    validationStatus: 'validated',
  }).populate('skillId');
};

/**
 * Get skills pending validation
 * Excludes the mentor's own skills
 */
UserSkillSchema.statics.getPendingValidationQueue = function (
  mentorId?: Types.ObjectId
) {
  const query: Record<string, unknown> = {
    validationStatus: { $in: ['none', 'pending'] },
    source: { $in: ['self', 'resume'] },
  };

  // Exclude mentor's own skills
  if (mentorId) {
    query.userId = { $ne: mentorId };
  }

  return this.find(query)
    .populate('userId', 'name email')
    .populate('skillId', 'name domain')
    .sort({ createdAt: -1 });
};

/**
 * Get skill counts grouped by source for a user
 * Used in readiness context display
 */
UserSkillSchema.statics.getSkillCountsBySource = async function (
  userId: Types.ObjectId
): Promise<Record<SkillSource, number>> {
  const results = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$source', count: { $sum: 1 } } },
  ]);

  const counts: Record<SkillSource, number> = {
    self: 0,
    resume: 0,
    validated: 0,
  };

  results.forEach((r: { _id: SkillSource; count: number }) => {
    counts[r._id] = r.count;
  });

  return counts;
};

// ============================================================================
// Model Export
// ============================================================================

const UserSkill: UserSkillModel =
  (mongoose.models.UserSkill as UserSkillModel) ||
  mongoose.model<IUserSkillDocument, UserSkillModel>('UserSkill', UserSkillSchema);

export default UserSkill;
