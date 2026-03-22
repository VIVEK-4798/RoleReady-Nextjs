import mongoose, { Schema, Document, Model } from 'mongoose';
import type { IUser, IUserProfile, UserRole } from '@/types';



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
  publicId: { type: String },
}, { _id: false });

const ProfileSchema = new Schema<IUserProfile>({
  about: { type: String },
  bio: { type: String },
  headline: { type: String },
  location: { type: String },
  linkedinUrl: { type: String },
  githubUrl: { type: String },
  targetRoleId: { type: Schema.Types.ObjectId, ref: 'Role' },
  education: [EducationSchema],
  experience: [ExperienceSchema],
  projects: [ProjectSchema],
  certificates: [CertificateSchema],
  achievements: [AchievementSchema],
  resume: ResumeSchema,
  hasGeneratedResume: { type: Boolean, default: false },
  socialLinks: {
    linkedin: { type: String },
    github: { type: String },
    twitter: { type: String },
  },
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
      // Optional for OAuth users (Google, etc)
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
      default: null,
    },
    emailVerified: {
      type: Date,
      // Set for OAuth users, null for credentials users until verified
      default: null,
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
    // Mentor Specific Fields
    title: { type: String },
    company: { type: String },
    experience: { type: Number },
    isVerifiedMentor: { type: Boolean, default: false },
    linkedinId: {
      type: String,
      sparse: true, // Allow multiple null values but unique non-null values
    },
    githubId: {
      type: String,
      sparse: true,
    },
    githubUsername: {
      type: String,
      trim: true,
    },
    githubAccessToken: {
      type: String,
      select: false, // Security: Don't include in default queries
    },
    authProvider: {
      type: String,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Mentor Ownership Model
    // If mentorId is set, this user is owned by that mentor
    // All validation requests go ONLY to the assigned mentor
    // If null, validation requests go to admin queue
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true, // Critical for mentor queries
    },
    mentorAssignedAt: {
      type: Date,
      default: null,
    },
    mentorAssignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Admin who assigned the mentor
      default: null,
    },
    // Legacy field - keep for backward compatibility, will be deprecated
    assignedMentor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    // Email notification preferences
    emailPreferences: {
      type: {
        skillReminders: { type: Boolean, default: true },
        roadmapUpdates: { type: Boolean, default: true },
        weeklyReports: { type: Boolean, default: true },
        mentorMessages: { type: Boolean, default: true },
        systemAnnouncements: { type: Boolean, default: true },
        marketingEmails: { type: Boolean, default: false },
      },
      default: () => ({
        skillReminders: true,
        roadmapUpdates: true,
        weeklyReports: true,
        mentorMessages: true,
        systemAnnouncements: true,
        marketingEmails: false,
      }),
    },
    // Privacy and visibility settings
    privacySettings: {
      type: {
        profileVisibility: { type: String, enum: ['public', 'private', 'connections'], default: 'public' },
        showEmail: { type: Boolean, default: false },
        showSkills: { type: Boolean, default: true },
        showProgress: { type: Boolean, default: true },
        allowMentorRequests: { type: Boolean, default: true },
        showInSearch: { type: Boolean, default: true },
      },
      default: () => ({
        profileVisibility: 'public',
        showEmail: false,
        showSkills: true,
        showProgress: true,
        allowMentorRequests: true,
        showInSearch: true,
      }),
    },
    // Track when password was last changed
    passwordChangedAt: {
      type: Date,
    },
    plan: {
      type: String,
      enum: ['FREE', 'PRO', 'PREMIUM'],
      default: 'FREE',
    },
    usage: {
      type: {
        readinessChecksUsed: { type: Number, default: 0 },
        roadmapGenerated: { type: Number, default: 0 },
        resumeGenerated: { type: Number, default: 0 },
        skillExtractionsUsed: { type: Number, default: 0 },
        mentorRequestsUsed: { type: Number, default: 0 },
        ticketsUsed: { type: Number, default: 0 },
      },
      default: () => ({
        readinessChecksUsed: 0,
        roadmapGenerated: 0,
        resumeGenerated: 0,
        skillExtractionsUsed: 0,
        mentorRequestsUsed: 0,
        ticketsUsed: 0,
      }),
    },
    payments: [
      {
        orderId: { type: String, required: true },
        paymentId: { type: String },
        plan: { type: String, required: true },
        amount: { type: Number, required: true },
        status: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING'], default: 'PENDING' },
        createdAt: { type: Date, default: Date.now },
      }
    ],
    usageResetDate: {
      type: Date,
      default: null,
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
    evaluationState: {
      type: {
        readinessOutdated: { type: Boolean, default: true },
        roadmapOutdated: { type: Boolean, default: true },
        atsOutdated: { type: Boolean, default: true },
        reportOutdated: { type: Boolean, default: true },
        lastReadinessCalculatedAt: { type: Date },
        lastATSCalculatedAt: { type: Date },
        lastRoadmapGeneratedAt: { type: Date },
      },
      default: () => ({
        readinessOutdated: true,
        roadmapOutdated: true,
        atsOutdated: true,
        reportOutdated: true,
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
  // OAuth users without password cannot use password-based auth
  if (!this.password) {
    return false;
  }

  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

// ============================================================================
// Pre-save Middleware
// ============================================================================

/**
 * Hash password before saving
 * Only hash if password is modified and exists (for OAuth users without password)
 */
UserSchema.pre('save', async function () {
  const user = this as IUserDocument;
  // Only hash if password is modified and not null
  if (!user.isModified('password') || !user.password) {
    return;
  }

  const bcrypt = await import('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

/**
 * Sync social links legacy fields
 */
UserSchema.pre('save', async function () {
  const user = this as IUserDocument;

  if (user.profile) {
    // Ensure socialLinks exists
    if (!user.profile.socialLinks) {
      user.profile.socialLinks = {};
    }

    // If socialLinks was directly modified, sync TO legacy fields
    if (user.isDirectModified('profile.socialLinks.linkedin')) {
      user.profile.linkedinUrl = user.profile.socialLinks.linkedin;
    }
    if (user.isDirectModified('profile.socialLinks.github')) {
      user.profile.githubUrl = user.profile.socialLinks.github;
    }
    if (user.isDirectModified('profile.linkedinUrl')) {
      user.profile.socialLinks.linkedin = user.profile.linkedinUrl;
    }
    if (user.isDirectModified('profile.githubUrl')) {
      user.profile.socialLinks.github = user.profile.githubUrl;
    }
  }
});

// ============================================================================
// Model Export
// ============================================================================

// Prevent model recompilation in development with hot reloading
const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;
