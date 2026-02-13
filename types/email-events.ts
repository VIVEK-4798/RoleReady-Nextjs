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
    | 'MENTOR_SKILL_VALIDATED';

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

export type EmailEventMetadata =
    | WelcomeUserMetadata
    | RoleSelectedMetadata
    | ReadinessFirstMetadata
    | ReadinessMajorImprovementMetadata
    | MentorSkillValidatedMetadata;

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
