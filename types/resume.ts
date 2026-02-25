import { SkillLevel } from './index';

export interface ResumeData {
    contact: {
        fullName: string;
        email: string;
        phone?: string;
        linkedin?: string;
        github?: string;
        location?: string;
        headline?: string;
    };
    summary?: string;
    skills: {
        name: string;
        level: SkillLevel;
    }[];
    groupedSkills?: Record<string, string[]>;
    experience: {
        title: string;
        company: string;
        location?: string;
        startDate?: string;
        endDate?: string;
        isCurrent: boolean;
        description?: string;
    }[];
    projects: {
        name: string;
        description?: string;
        technologies: string[];
        url?: string;
        githubUrl?: string;
        startDate?: string;
        endDate?: string;
    }[];
    education: {
        institution: string;
        degree: string;
        fieldOfStudy?: string;
        startDate?: string;
        endDate?: string;
        grade?: string;
    }[];
    certificates?: {
        name: string;
        issuer: string;
        date?: string;
    }[];
    achievements?: {
        title: string;
        issuer: string;
        date?: string;
        description?: string;
    }[];
}

export interface ResumeEligibility {
    eligible: boolean;
    missingFields: string[];
    missingIds?: string[];
    warnings: string[];
}
