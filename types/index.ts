/**
 * Shared TypeScript Types for RoleReady
 * 
 * These types are used across the application for type safety.
 * They mirror the Mongoose schemas but are framework-agnostic.
 */

import { Types } from 'mongoose';

// ============================================================================
// User Types
// ============================================================================

export type UserRole = 'user' | 'mentor' | 'admin';

export type SkillSource = 'self' | 'resume' | 'validated';

export type ValidationStatus = 'none' | 'pending' | 'validated' | 'rejected';

export type SkillLevel = 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface IEducation {
  _id?: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: Date;
  endDate?: Date;
  grade?: string;
  description?: string;
  isCurrent?: boolean;
}

export interface IExperience {
  _id?: string;
  company: string;
  title: string;
  location?: string;
  description?: string;
  skills?: string[];
  startDate?: Date;
  endDate?: Date;
  isCurrent?: boolean;
}

export interface IProject {
  _id?: string;
  name: string;
  description?: string;
  url?: string;
  githubUrl?: string;
  technologies?: string[];
  startDate?: Date;
  endDate?: Date;
  isOngoing?: boolean;
}

export interface ICertificate {
  name: string;
  issuer?: string;
  issueDate?: Date;
  expiryDate?: Date;
  url?: string;
}

export interface IAchievement {
  _id?: Types.ObjectId;
  title: string;
  description?: string;
  issuer?: string;
  date?: Date;
}

export interface IResume {
  fileUrl: string;
  fileName: string;
  uploadedAt: Date;
  parsedText?: string;
  publicId?: string;
}

export interface IUserProfile {
  about?: string;
  bio?: string;
  headline?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  targetRoleId?: Types.ObjectId;
  education?: IEducation[];
  experience?: IExperience[];
  projects?: IProject[];
  certificates?: ICertificate[];
  achievements?: IAchievement[];
  resume?: IResume;
  niche?: string;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string | null; // Optional for OAuth users
  role: UserRole;
  mobile?: string;
  image?: string;
  linkedinId?: string; // LinkedIn OAuth ID
  githubId?: string; // GitHub OAuth ID
  githubUsername?: string; // GitHub username
  githubAccessToken?: string; // GitHub access token (stored on server ONLY)
  authProvider?: string; // Type of auth used (google, linkedin, github, credentials)
  emailVerified?: Date | null; // Set for OAuth users, null for credentials users
  isActive: boolean;
  mentorId?: Types.ObjectId; // Critical for mentor queries
  mentorAssignedAt?: Date;
  mentorAssignedBy?: Types.ObjectId;
  assignedMentor?: Types.ObjectId; // Legacy support
  emailPreferences?: {
    skillReminders: boolean;
    roadmapUpdates: boolean;
    weeklyReports: boolean;
    mentorMessages: boolean;
    systemAnnouncements: boolean;
    marketingEmails: boolean;
  };
  profile?: IUserProfile;
  privacySettings?: {
    profileVisibility: 'public' | 'private' | 'connections';
    showEmail: boolean;
    showSkills: boolean;
    showProgress: boolean;
    allowMentorRequests: boolean;
    showInSearch: boolean;
  };
  passwordChangedAt?: Date;
  evaluationState?: {
    readinessOutdated: boolean;
    roadmapOutdated: boolean;
    atsOutdated: boolean;
    reportOutdated: boolean;
    lastReadinessCalculatedAt?: Date;
    lastATSCalculatedAt?: Date;
    lastRoadmapGeneratedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Skill Types
// ============================================================================

export type SkillDomain =
  | 'technical'
  | 'soft-skills'
  | 'tools'
  | 'frameworks'
  | 'languages'
  | 'databases'
  | 'cloud'
  | 'other';

export interface ISkill {
  _id: Types.ObjectId;
  name: string;
  normalizedName: string;
  domain: SkillDomain;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Role (Category) Types
// ============================================================================

export type SkillImportance = 'required' | 'optional';

export interface IRoleBenchmark {
  _id?: Types.ObjectId;
  skillId: Types.ObjectId;
  importance: SkillImportance;
  weight: number;
  requiredLevel: SkillLevel;
  isActive: boolean;
}

export interface IRole {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  colorClass: string;
  isActive: boolean;
  benchmarks: IRoleBenchmark[];
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// User Skill Types (for tracking user's skills)
// ============================================================================

export interface IUserSkill {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  skillId: Types.ObjectId;
  level: SkillLevel;
  source: SkillSource;
  validationStatus: ValidationStatus;
  validatedBy?: Types.ObjectId;
  validatedAt?: Date;
  validationNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Target Role Types
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
  readinessAtChange?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// GitHub Import Types
// ============================================================================

export interface IGitHubRepo {
  id: string;
  name: string;
  description: string | null;
  htmlUrl: string;
  primaryLanguage: string | null;
  topics: string[];
  stars: number;
  forks: number;
  updatedAt: string;
  isFork: boolean;
}

export interface IImportRequest {
  repoIds: string[];
}

export interface IImportResult {
  importedCount: number;
  skippedCount: number;
  projects: any[]; // Using any for now, could be project items
}
