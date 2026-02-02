/**
 * Role Model (formerly "Category" in the old project)
 * 
 * Design Decisions:
 * 
 * 1. RENAMED FROM CATEGORY: "Role" is more intuitive for a job-readiness platform.
 *    Roles represent target job positions (e.g., "Frontend Developer", "Data Analyst").
 * 
 * 2. EMBEDDED BENCHMARKS: The role-skill mapping (benchmarks) is embedded directly
 *    in the Role document. This is optimal because:
 *    - Benchmarks are always accessed with the role (1:N bounded relationship)
 *    - Reduces joins/lookups when calculating readiness
 *    - A role typically has 5-20 skills (well within MongoDB's embedding limits)
 *    - Benchmarks are role-specific and don't need independent queries
 * 
 * 3. SKILL REFERENCE: Each benchmark references a Skill document by ObjectId.
 *    This allows skills to be reused across multiple roles while keeping
 *    role-specific settings (importance, weight, requiredLevel) in the benchmark.
 * 
 * 4. IMPORTANCE + WEIGHT SEPARATION:
 *    - importance: Categorical ("required" vs "optional") - affects pass/fail logic
 *    - weight: Numeric - affects percentage score calculation
 *    This mirrors the old system's logic exactly.
 * 
 * 5. REQUIRED LEVEL: Defines the minimum skill level needed to "meet" this benchmark.
 *    Allows nuanced requirements like "needs intermediate JavaScript, but beginner Git is OK".
 */

import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import type { IRole, IRoleBenchmark, SkillImportance, SkillLevel } from '@/types';

// ============================================================================
// Benchmark Sub-Schema (Embedded)
// ============================================================================

const BenchmarkSchema = new Schema<IRoleBenchmark>(
  {
    skillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill reference is required'],
    },
    importance: {
      type: String,
      enum: {
        values: ['required', 'optional'] as SkillImportance[],
        message: '{VALUE} is not a valid importance level',
      },
      default: 'optional',
    },
    weight: {
      type: Number,
      min: [1, 'Weight must be at least 1'],
      max: [10, 'Weight cannot exceed 10'],
      default: 1,
    },
    requiredLevel: {
      type: String,
      enum: {
        values: ['none', 'beginner', 'intermediate', 'advanced', 'expert'] as SkillLevel[],
        message: '{VALUE} is not a valid skill level',
      },
      default: 'beginner',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true } // Keep _id for individual benchmark identification
);

// ============================================================================
// Role Document Interface
// ============================================================================

export interface IRoleDocument extends Omit<IRole, '_id'>, Document {
  addBenchmark(benchmark: Partial<IRoleBenchmark>): Promise<IRoleDocument>;
  removeBenchmark(skillId: Types.ObjectId): Promise<IRoleDocument>;
  getBenchmarkForSkill(skillId: Types.ObjectId): IRoleBenchmark | undefined;
}

// ============================================================================
// Role Schema
// ============================================================================

const RoleSchema = new Schema<IRoleDocument>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Role name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    colorClass: {
      type: String,
      default: 'bg-blue-500',
      // Tailwind color class for UI theming
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    benchmarks: {
      type: [BenchmarkSchema],
      default: [],
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
// Virtuals
// ============================================================================

/**
 * Count of active benchmarks (skills assigned to this role)
 */
RoleSchema.virtual('skillCount').get(function () {
  return this.benchmarks?.filter((b) => b.isActive).length || 0;
});

/**
 * Count of required skills
 */
RoleSchema.virtual('requiredSkillCount').get(function () {
  return (
    this.benchmarks?.filter((b) => b.isActive && b.importance === 'required')
      .length || 0
  );
});

/**
 * Total weight of all active benchmarks (max possible score)
 */
RoleSchema.virtual('totalWeight').get(function () {
  return (
    this.benchmarks
      ?.filter((b) => b.isActive)
      .reduce((sum, b) => sum + b.weight, 0) || 0
  );
});

// ============================================================================
// Indexes
// ============================================================================

// For listing active roles
RoleSchema.index({ isActive: 1, name: 1 });

// For finding roles by skill (when skill is updated/deleted)
RoleSchema.index({ 'benchmarks.skillId': 1 });

// Full-text search
RoleSchema.index({ name: 'text', description: 'text' });

// ============================================================================
// Instance Methods
// ============================================================================

/**
 * Add a benchmark (skill requirement) to this role
 */
RoleSchema.methods.addBenchmark = async function (
  benchmark: Partial<IRoleBenchmark>
): Promise<IRoleDocument> {
  // Check if skill already exists in benchmarks
  const existingIndex = this.benchmarks.findIndex(
    (b: IRoleBenchmark) => b.skillId.toString() === benchmark.skillId?.toString()
  );

  if (existingIndex >= 0) {
    // Update existing benchmark
    Object.assign(this.benchmarks[existingIndex], benchmark);
  } else {
    // Add new benchmark
    this.benchmarks.push(benchmark);
  }

  return this.save();
};

/**
 * Remove a benchmark by skill ID
 */
RoleSchema.methods.removeBenchmark = async function (
  skillId: Types.ObjectId
): Promise<IRoleDocument> {
  this.benchmarks = this.benchmarks.filter(
    (b: IRoleBenchmark) => b.skillId.toString() !== skillId.toString()
  );
  return this.save();
};

/**
 * Get benchmark for a specific skill
 */
RoleSchema.methods.getBenchmarkForSkill = function (
  skillId: Types.ObjectId
): IRoleBenchmark | undefined {
  return this.benchmarks.find(
    (b: IRoleBenchmark) => b.skillId.toString() === skillId.toString()
  );
};

// ============================================================================
// Static Methods
// ============================================================================

/**
 * Get roles that include a specific skill
 */
RoleSchema.statics.findBySkill = function (skillId: Types.ObjectId) {
  return this.find({
    'benchmarks.skillId': skillId,
    'benchmarks.isActive': true,
    isActive: true,
  });
};

// ============================================================================
// Model Export
// ============================================================================

const Role: Model<IRoleDocument> =
  mongoose.models.Role || mongoose.model<IRoleDocument>('Role', RoleSchema);

export default Role;
