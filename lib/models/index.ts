/**
 * Models Index
 * 
 * Central export point for all Mongoose models.
 * This ensures consistent imports across the application.
 */

export { default as User } from './User';
export { default as Skill } from './Skill';
export { default as Role } from './Role';
export { default as UserSkill } from './UserSkill';
export { default as Otp } from './Otp';
export { Resume } from './Resume';
export { default as TargetRole } from './TargetRole';
export { default as Notification } from './Notification';
export { default as ReadinessSnapshot } from './ReadinessSnapshot';
export { default as Roadmap } from './Roadmap';
export { default as Category } from './Category';
export { default as Internship } from './Internship';
export { default as Job } from './Job';
export { default as ActivityLog } from './ActivityLog';
export { default as DemoSession } from './DemoSession';
export { UserEmailEvent } from './UserEmailEvent';
export { default as Ticket } from './Ticket';
export { default as TicketMessage } from './TicketMessage';
export { default as MentorRoleRequest } from './MentorRoleRequest';
export { default as MentorApplication } from './MentorApplication';
export { default as ATSScore } from './ATSScore';
export { default as Feedback } from './Feedback';

// Re-export document interfaces for convenience
export type { IUserDocument } from './User';
export type { ISkillDocument } from './Skill';
export type { IRoleDocument } from './Role';
export type { IUserSkillDocument } from './UserSkill';
export type { IOtpDocument } from './Otp';
export type { IResumeDocument } from './Resume';
export type { ITargetRoleDocument, RoleSelector } from './TargetRole';
export type { INotificationDocument, NotificationType } from './Notification';
export type { IReadinessSnapshotDocument, SnapshotTrigger, ISkillBreakdown } from './ReadinessSnapshot';
export type { IRoadmapDocument, IRoadmapStep, StepType, StepStatus, RoadmapStatus } from './Roadmap';
export type { ICategory } from './Category';
export type { IInternship } from './Internship';
export type { IJob } from './Job';
export type { IActivityLogDocument, ActionType, ActivityRole, UserActionType, MentorActionType } from './ActivityLog';
export type { IDemoSession, IDemoSkill } from './DemoSession';
export type { IUserEmailEvent, IUserEmailEventDocument } from './UserEmailEvent';
export type { ITicket, ITicketDocument, TicketCategory, TicketPriority, TicketStatus, TicketRole } from './Ticket';
export type { ITicketMessage, ITicketMessageDocument, MessageSenderRole } from './TicketMessage';
export type { IATSScoreDocument } from './ATSScore';
export type { IFeedback } from './Feedback';
