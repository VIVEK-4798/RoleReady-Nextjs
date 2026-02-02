/**
 * Skill Model
 * 
 * Design Decisions:
 * 
 * 1. STANDALONE COLLECTION: Skills are stored in their own collection because:
 *    - Skills are referenced by multiple entities (Roles, Users)
 *    - Skills can be managed independently (admin CRUD)
 *    - Avoids data duplication across roles
 * 
 * 2. NORMALIZED NAME: Pre-computed lowercase version for efficient searching
 *    and matching (especially for resume parsing).
 * 
 * 3. DOMAIN CLASSIFICATION: Categorizes skills for filtering and organization.
 *    Domain is NOT the same as Role - a skill like "JavaScript" might belong
 *    to multiple roles but has one domain ("technical").
 * 
 * 4. SOFT DELETE: isActive flag for soft deletion. Skills may be referenced
 *    in historical data, so we never hard delete.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import type { ISkill, SkillDomain } from '@/types';

// ============================================================================
// Skill Document Interface
// ============================================================================

export interface ISkillDocument extends Omit<ISkill, '_id'>, Document {}

// ============================================================================
// Skill Schema
// ============================================================================

const SkillSchema = new Schema<ISkillDocument>(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      maxlength: [100, 'Skill name cannot exceed 100 characters'],
    },
    normalizedName: {
      type: String,
      lowercase: true,
      trim: true,
    },
    domain: {
      type: String,
      enum: {
        values: [
          'technical',
          'soft-skills',
          'tools',
          'frameworks',
          'languages',
          'databases',
          'cloud',
          'other',
        ] as SkillDomain[],
        message: '{VALUE} is not a valid domain',
      },
      default: 'other',
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Unique constraint on normalized name to prevent duplicates
SkillSchema.index({ normalizedName: 1 }, { unique: true });

// For filtering by domain
SkillSchema.index({ domain: 1, isActive: 1 });

// Full-text search on name and description
SkillSchema.index({ name: 'text', description: 'text' });

// ============================================================================
// Pre-save Middleware
// ============================================================================

/**
 * Auto-generate normalizedName from name before saving
 */
SkillSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.normalizedName = this.name
      .toLowerCase()
      .trim()
      // Keep alphanumeric, spaces, and common tech characters (+, #, .)
      .replace(/[^a-z0-9\s\+\#\.\_\-]/g, '')
      .replace(/\s+/g, ' ');
  }
});

// ============================================================================
// Static Methods
// ============================================================================

/**
 * Find skills by matching normalized names
 * Used for resume parsing and skill matching
 */
SkillSchema.statics.findByNormalizedNames = function (names: string[]) {
  const normalizedNames = names.map((name) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s\+\#\.\_\-]/g, '')
      .replace(/\s+/g, ' ')
  );
  
  return this.find({
    normalizedName: { $in: normalizedNames },
    isActive: true,
  });
};

// ============================================================================
// Model Export
// ============================================================================

const Skill: Model<ISkillDocument> =
  mongoose.models.Skill || mongoose.model<ISkillDocument>('Skill', SkillSchema);

export default Skill;
