import { SkillLevel } from './index';

export interface ResumeData {
    contact: {
        fullName: string;
        email: string;
        phone?: string;
        linkedin?: string;
        github?: string;
        location?: string;
    };
    summary?: string;
    skills: {
        name: string;
        level: SkillLevel;
    }[];
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
}

export interface ResumeEligibility {
    eligible: boolean;
    missingFields: string[];
    warnings: string[];
}
