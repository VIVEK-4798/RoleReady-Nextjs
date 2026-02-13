/**
 * Email Event Type Definitions
 * 
 * Centralized type definitions for all lifecycle email events
 */

export type EmailEventType =
    | 'WELCOME_USER'
    | 'ROLE_SELECTED'
    | 'READINESS_FIRST'
    | 'READINESS_MAJOR_IMPROVEMENT'
    | 'MENTOR_SKILL_VALIDATED'
    | 'MENTOR_SKILL_REJECTED'
    | 'ROADMAP_CREATED'
    | 'USER_INACTIVE_7'
    | 'USER_INACTIVE_14'
    | 'USER_INACTIVE_30'
    | 'PLACEMENT_SEASON_ALERT'
    | 'WEEKLY_PROGRESS_DIGEST';

export interface BaseEmailEventMetadata {
    [key: string]: unknown;
}

export interface WelcomeUserMetadata extends BaseEmailEventMetadata {
    // No additional metadata needed
}

export interface RoleSelectedMetadata extends BaseEmailEventMetadata {
    roleName: string;
    roleId: string;
}

export interface ReadinessFirstMetadata extends BaseEmailEventMetadata {
    score: number;
    roleName: string;
    roleId: string;
}

export interface ReadinessMajorImprovementMetadata extends BaseEmailEventMetadata {
    oldScore: number;
    newScore: number;
    roleName: string;
    roleId: string;
}

export interface MentorSkillValidatedMetadata extends BaseEmailEventMetadata {
    skillName: string;
    skillId: string;
    mentorName?: string;
}

export interface MentorSkillRejectedMetadata extends BaseEmailEventMetadata {
    skillName: string;
    skillId: string;
    mentorName?: string;
    rejectionNote?: string;
}

export interface RoadmapCreatedMetadata extends BaseEmailEventMetadata {
    roleName: string;
    roleId: string;
    stepCount?: number;
}

export interface UserInactiveMetadata extends BaseEmailEventMetadata {
    daysSinceLastLogin: number;
    lastLoginDate?: string;
}

export interface PlacementSeasonAlertMetadata extends BaseEmailEventMetadata {
    season?: string;
    year?: number;
}

export interface WeeklyProgressDigestMetadata extends BaseEmailEventMetadata {
    currentScore?: number;
    scoreChange?: number;
    skillsValidated?: number;
    activitiesCompleted?: number;
    roleName?: string;
}

export type EmailEventMetadata =
    | WelcomeUserMetadata
    | RoleSelectedMetadata
    | ReadinessFirstMetadata
    | ReadinessMajorImprovementMetadata
    | MentorSkillValidatedMetadata
    | MentorSkillRejectedMetadata
    | RoadmapCreatedMetadata
    | UserInactiveMetadata
    | PlacementSeasonAlertMetadata
    | WeeklyProgressDigestMetadata;

export interface EmailTemplate {
    subject: string;
    html: string;
}

export interface TriggerEmailEventParams {
    userId: string;
    event: EmailEventType;
    metadata?: EmailEventMetadata;
}

export interface TriggerEmailEventResult {
    success: boolean;
    alreadySent?: boolean;
    error?: string;
}
