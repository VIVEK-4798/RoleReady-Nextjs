/**
 * ATS Score Type Definitions
 * 
 * Shared types for ATS compatibility scoring system.
 */

export interface ATSScoreBreakdown {
    relevance: number;        // 0-100: Keyword match score
    contextDepth: number;     // 0-100: Skill context quality
    structure: number;        // 0-100: Resume formatting
    impact: number;           // 0-100: Action verb usage
}

export interface ATSScoreResult {
    overallScore: number;     // 0-100: Weighted final score
    breakdown: ATSScoreBreakdown;
    missingKeywords: string[];
    suggestions: string[];
    calculatedAt: Date;
}

export interface ATSScoreResponse {
    atsScore: ATSScoreResult;
}

/**
 * Score interpretation levels
 */
export type ATSScoreLevel = 'excellent' | 'good' | 'fair' | 'poor';

export function getATSScoreLevel(score: number): ATSScoreLevel {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
}

/**
 * Component weights for final score calculation
 */
export const ATS_COMPONENT_WEIGHTS = {
    relevance: 0.40,      // 40%
    contextDepth: 0.25,   // 25%
    structure: 0.20,      // 20%
    impact: 0.15          // 15%
} as const;
