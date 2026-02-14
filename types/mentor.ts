/**
 * Mentor Assignment Types
 * 
 * Type definitions for the mentor ownership and validation routing system.
 */

import { Types } from 'mongoose';

// ============================================================================
// Mentor Assignment Types
// ============================================================================

export interface MentorAssignment {
    userId: string | Types.ObjectId;
    mentorId: string | Types.ObjectId;
    assignedBy: string | Types.ObjectId;
    assignedAt: Date;
}

export interface MentorWorkload {
    mentorId: string;
    mentorName: string;
    mentorEmail: string;
    assignedUsersCount: number;
    pendingValidationsCount: number;
    isActive: boolean;
}

export interface ValidationRecipient {
    recipientType: 'mentor' | 'admin';
    recipientIds: string[];
    reason: string;
}

export interface MentorAssignmentHistory {
    userId: string;
    previousMentorId: string | null;
    newMentorId: string | null;
    changedBy: string;
    changedAt: Date;
    reason?: string;
}

// ============================================================================
// Service Response Types
// ============================================================================

export interface AssignMentorResult {
    success: boolean;
    message: string;
    assignment?: MentorAssignment;
    error?: string;
}

export interface ChangeMentorResult {
    success: boolean;
    message: string;
    previousMentorId: string | null;
    newMentorId: string | null;
    error?: string;
}

export interface MentorUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    assignedAt: Date;
    pendingValidations: number;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface AssignMentorRequest {
    userId: string;
    mentorId: string;
}

export interface ChangeMentorRequest {
    userId: string;
    newMentorId: string;
    reason?: string;
}

export interface MentorWorkloadResponse {
    success: boolean;
    mentors: MentorWorkload[];
}

export interface MyUsersResponse {
    success: boolean;
    users: MentorUser[];
    total: number;
}
