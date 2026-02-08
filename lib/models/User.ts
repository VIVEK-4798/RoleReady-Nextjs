/**
 * User Model
 * 
 * Design Decisions:
 * 
 * 1. EMBEDDED PROFILE: Profile data is embedded directly in the User document
 *    rather than in a separate collection. This is optimal because:
 *    - Profile is always accessed with user data (1:1 relationship)
 *    - Reduces database queries
 *    - Atomic updates for user + profile
 * 
 * 2. ROLE-BASED ACCESS: Single 'role' field instead of separate tables for
 *    mentor_profile_info, admin_profile_info. The profile subdocument handles
 *    all role types uniformly.
 * 
 * 3. ARRAYS FOR COLLECTIONS: education, experience, projects, certificates
 *    are embedded arrays. In MongoDB, this is preferred for bounded lists
 *    that are always accessed together.
 * 
 * 4. PASSWORD HASHING: Done via pre-save middleware (not implemented here,
 *    will be added with auth layer).
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import type { IUser, IUserProfile, UserRole } from '@/types';

// ============================================================================
// Sub-Schemas (Embedded Documents)
// ============================================================================

const EducationSchema = new Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  grade: { type: String },
  description: { type: String },
  isCurrent: { type: Boolean, default: false },
}, { _id: true });

const ExperienceSchema = new Schema({
  company: { type: String, required: true },
  title: { type: String, required: true },
  location: { type: String },
  description: { type: String },
  skills: [{ type: String }],
  startDate: { type: Date },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: false },
}, { _id: true });

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  url: { type: String },
  githubUrl: { type: String },
  technologies: [{ type: String }],
  startDate: { type: Date },
  endDate: { type: Date },
  isOngoing: { type: Boolean, default: false },
}, { _id: true });

const CertificateSchema = new Schema({
  name: { type: String, required: true },
  issuer: { type: String },
  issueDate: { type: Date },
  expiryDate: { type: Date },
  url: { type: String },
}, { _id: false });

const AchievementSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  issuer: { type: String },
  date: { type: Date },
}, { _id: true });

const ResumeSchema = new Schema({
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  parsedText: { type: String },
}, { _id: false });

const ProfileSchema = new Schema<IUserProfile>({
  about: { type: String },
  bio: { type: String },
  headline: { type: String },
  location: { type: String },
  linkedinUrl: { type: String },
  githubUrl: { type: String },
  portfolioUrl: { type: String },
  targetRoleId: { type: Schema.Types.ObjectId, ref: 'Role' },
  education: [EducationSchema],
  experience: [ExperienceSchema],
  projects: [ProjectSchema],
  certificates: [CertificateSchema],
  achievements: [AchievementSchema],
  resume: ResumeSchema,
  niche: { type: String },
}, { _id: false });

// ============================================================================
// Main User Schema
// ============================================================================

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'mentor', 'admin'] as UserRole[],
        message: '{VALUE} is not a valid role',
      },
      default: 'user',
    },
    mobile: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Assigned mentor for skill validation (optional - if null, any mentor can validate)
    assignedMentor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    profile: {
      type: ProfileSchema,
      default: () => ({
        education: [],
        experience: [],
        projects: [],
        certificates: [],
        achievements: [],
      }),
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ============================================================================
// Indexes
// ============================================================================

// Note: email already has unique index from schema definition
// Index for role-based queries (e.g., get all mentors)
UserSchema.index({ role: 1, isActive: 1 });
// Index for searching users by name
UserSchema.index({ name: 'text' });

// ============================================================================
// Instance Methods
// ============================================================================

/**
 * Compare password with hashed password
 * Note: bcrypt will be imported when auth is implemented
 */
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // Placeholder - will be implemented with bcrypt in auth phase
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

// ============================================================================
// Pre-save Middleware
// ============================================================================

/**
 * Hash password before saving
 */
UserSchema.pre('save', async function () {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return;
  }

  const bcrypt = await import('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ============================================================================
// Model Export
// ============================================================================

// Prevent model recompilation in development with hot reloading
const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;
