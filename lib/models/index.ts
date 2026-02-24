import User from './User';
import Skill from './Skill';
import Role from './Role';
import UserSkill from './UserSkill';
import Otp from './Otp';
import { Resume } from './Resume';
import TargetRole from './TargetRole';
import Notification from './Notification';
import ReadinessSnapshot from './ReadinessSnapshot';
import Roadmap from './Roadmap';
import Category from './Category';
import Internship from './Internship';
import Job from './Job';
import ActivityLog from './ActivityLog';
import DemoSession from './DemoSession';
import { UserEmailEvent } from './UserEmailEvent';
import Ticket from './Ticket';
import TicketMessage from './TicketMessage';
import MentorRoleRequest from './MentorRoleRequest';
import MentorApplication from './MentorApplication';
import ATSScore from './ATSScore';
import Feedback from './Feedback';

/**
 * Models Index
 * 
 * Central export point for all Mongoose models.
 * This ensures consistent imports across the application.
 */

export {
    User,
    Skill,
    Role,
    UserSkill,
    Otp,
    Resume,
    TargetRole,
    Notification,
    ReadinessSnapshot,
    Roadmap,
    Category,
    Internship,
    Job,
    ActivityLog,
    DemoSession,
    UserEmailEvent,
    Ticket,
    TicketMessage,
    MentorRoleRequest,
    MentorApplication,
    ATSScore,
    Feedback
};

// Explicit initialization function to force registration
export function initModels() {
    return {
        User, Skill, Role, UserSkill, Otp, Resume, TargetRole,
        Notification, ReadinessSnapshot, Roadmap, Category,
        Internship, Job, ActivityLog, DemoSession, UserEmailEvent,
        Ticket, TicketMessage, MentorRoleRequest, MentorApplication,
        ATSScore, Feedback
    };
}

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
