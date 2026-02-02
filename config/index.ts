/**
 * Application Configuration
 * 
 * Centralized configuration for the RoleReady application.
 * All environment-dependent values should be defined here.
 */

export const config = {
  // Application metadata
  app: {
    name: 'RoleReady',
    description: 'Job readiness assessment and skill development platform',
    version: '1.0.0',
  },

  // API configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  },

  // Authentication configuration
  auth: {
    sessionMaxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    otpExpiryMinutes: 5,
  },

  // Readiness calculation configuration
  readiness: {
    // Minimum time between recalculations (in minutes)
    cooldownMinutes: 5,
    // Bonus multiplier for validated skills
    validatedSkillBonus: 1.25,
  },

  // Pagination defaults
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },

  // File upload configuration
  upload: {
    maxFileSizeMB: 10,
    allowedResumeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    resumeExtensions: ['.pdf', '.doc', '.docx'],
  },

  // Status labels for readiness scores
  readinessStatus: {
    NOT_READY: { min: 0, max: 39, label: 'Not Ready', color: 'red' },
    DEVELOPING: { min: 40, max: 69, label: 'Developing', color: 'yellow' },
    READY: { min: 70, max: 89, label: 'Ready', color: 'green' },
    EXCELLENT: { min: 90, max: 100, label: 'Excellent', color: 'blue' },
  },

  // Skill level numeric values (for comparison)
  skillLevels: {
    none: 0,
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
  },

  // Priority levels for roadmap items
  priorityLevels: {
    HIGH: { minScore: 60, label: 'High Priority', color: 'red' },
    MEDIUM: { minScore: 30, label: 'Medium Priority', color: 'yellow' },
    LOW: { minScore: 0, label: 'Low Priority', color: 'green' },
  },
} as const;

export type Config = typeof config;
export default config;
