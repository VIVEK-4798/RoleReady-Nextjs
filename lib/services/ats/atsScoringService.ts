/**
 * ATS Compatibility Scoring Service
 * 
 * Evaluates how well a user's resume is optimized for their target role.
 * This is NOT a skill capability score - it measures resume representation quality.
 * 
 * ARCHITECTURE:
 * - Multi-dimensional scoring (4 components)
 * - Rule-based, explainable
 * - Reuses existing resume and benchmark data
 * - Pure function design
 * 
 * SCORING FORMULA:
 * Final Score = (Keyword Relevance × 40%) + (Context Depth × 25%) + 
 *               (Structure × 20%) + (Impact Language × 15%)
 */

import { Types } from 'mongoose';
import connectDB from '@/lib/db/mongoose';
import { Resume } from '@/lib/models/Resume';
import Role from '@/lib/models/Role';
import TargetRole from '@/lib/models/TargetRole';
import ATSScore from '@/lib/models/ATSScore';
import { evaluateGroupLogic, ItemMatch } from '@/lib/utils/evaluation';

// ============================================================================
// Types
// ============================================================================

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

interface ATSBenchmarkSkill {
    skillId: string;
    skillName: string;
    weight: number;
    importance: 'required' | 'optional';
}

interface ATSBenchmarkGroup {
    name: string;
    type: 'ALL_REQUIRED' | 'ANY_ONE_REQUIRED';
    weight: number;
    required: boolean;
    skills: {
        skillId: string;
        skillName: string;
    }[];
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Action verbs that indicate impact and achievement
 */
const ACTION_VERBS = [
    'built', 'developed', 'implemented', 'optimized', 'designed',
    'improved', 'led', 'created', 'reduced', 'increased',
    'achieved', 'delivered', 'launched', 'managed', 'established',
    'streamlined', 'automated', 'enhanced', 'scaled', 'architected'
];

/**
 * Component weights for final score calculation
 */
const COMPONENT_WEIGHTS = {
    relevance: 0.40,      // 40%
    contextDepth: 0.25,   // 25%
    structure: 0.20,      // 20%
    impact: 0.15          // 15%
};

/**
 * Structure scoring points
 */
const STRUCTURE_POINTS = {
    hasSkillsSection: 20,
    hasExperience: 25,
    hasEducation: 15,
    hasContact: 20,
    properLength: 20
};

// ============================================================================
// Component 1: Keyword Relevance Score (40%)
// ============================================================================

/**
 * Calculate keyword relevance based on role benchmark skills.
 * 
 * Formula: (sum of matched skill weights / total role weight) × 100
 * 
 * @param resumeText - Full resume text (case-insensitive search)
 * @param benchmarks - Role skill benchmarks with weights
 * @returns Score 0-100 and list of missing keywords
 */
function calculateKeywordRelevance(
    resumeText: string,
    benchmarks: ATSBenchmarkSkill[],
    benchmarkGroups: ATSBenchmarkGroup[]
): { score: number; missingKeywords: string[] } {
    if (!resumeText && benchmarks.length === 0 && benchmarkGroups.length === 0) {
        return { score: 0, missingKeywords: [] };
    }

    const lowerText = resumeText?.toLowerCase() || '';
    let totalMatchedWeight = 0;
    let totalMaxWeight = 0;
    const missingKeywords: string[] = [];

    // 1. Process individual standalone benchmarks
    for (const benchmark of benchmarks) {
        totalMaxWeight += benchmark.weight;

        // Check if skill name appears in resume (case-insensitive)
        const skillLower = benchmark.skillName.toLowerCase();
        if (lowerText.includes(skillLower)) {
            totalMatchedWeight += benchmark.weight;
        } else if (benchmark.importance === 'required') {
            missingKeywords.push(benchmark.skillName);
        }
    }

    // 2. Process benchmark groups using shared evaluation logic
    for (const group of benchmarkGroups) {
        totalMaxWeight += group.weight;

        const itemMatches: ItemMatch[] = group.skills.map(skill => {
            const matched = lowerText.includes(skill.skillName.toLowerCase());
            return {
                name: skill.skillName,
                matched,
                score: matched ? 1 : 0
            };
        });

        const result = evaluateGroupLogic(group.type, itemMatches);

        // Add weighted score (result.score is 0-1)
        totalMatchedWeight += result.score * group.weight;

        // Collect missing keywords if group is not satisfied
        if (group.required && !result.satisfied) {
            if (group.type === 'ANY_ONE_REQUIRED') {
                missingKeywords.push(`At least one of: ${group.skills.map(s => s.skillName).join(', ')}`);
            } else {
                // For ALL_REQUIRED, only list specific missing skills
                missingKeywords.push(...result.missingNames);
            }
        }
    }

    const score = totalMaxWeight > 0 ? (totalMatchedWeight / totalMaxWeight) * 100 : 0;
    return { score: Math.round(score), missingKeywords };
}

// ============================================================================
// Component 2: Skill Context Depth Score (25%)
// ============================================================================

/**
 * Evaluate how well skills are contextualized (not just keyword stuffing).
 * 
 * Scoring:
 * - 1 mention: base credit
 * - 2-3 mentions: bonus
 * - Appears in experience section: additional bonus
 * 
 * @param resumeText - Full resume text
 * @param benchmarks - Role skill benchmarks
 * @param experienceSection - Optional experience section text
 * @returns Score 0-100
 */
function calculateContextDepth(
    resumeText: string,
    benchmarks: ATSBenchmarkSkill[],
    benchmarkGroups: ATSBenchmarkGroup[],
    experienceSection?: string
): number {
    if (!resumeText && benchmarks.length === 0 && benchmarkGroups.length === 0) {
        return 0;
    }

    const lowerText = resumeText?.toLowerCase() || '';
    const lowerExperience = experienceSection?.toLowerCase() || '';

    let totalPoints = 0;
    let maxPossiblePoints = 0;

    const evaluateSkillContext = (skillName: string): number => {
        const skillLower = skillName.toLowerCase();
        // Use a more robust check for occurrences
        const occurrences = (lowerText.match(new RegExp(skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        if (occurrences === 0) return 0;

        const maxForSkill = 10;
        let points = 0;

        if (occurrences === 1) points = maxForSkill * 0.4;
        else if (occurrences >= 2 && occurrences <= 3) points = maxForSkill * 0.7;
        else points = maxForSkill * 0.8;

        if (lowerExperience && lowerExperience.includes(skillLower)) {
            points += maxForSkill * 0.2;
        }

        return Math.min(points, maxForSkill);
    };

    // 1. Evaluate individual benchmarks
    for (const benchmark of benchmarks) {
        maxPossiblePoints += 10;
        totalPoints += evaluateSkillContext(benchmark.skillName);
    }

    // 2. Evaluate group benchmarks using shared evaluation logic
    for (const group of benchmarkGroups) {
        maxPossiblePoints += 10; // Treat the whole group as 1 unit for context depth scaling

        const itemMatches: ItemMatch[] = group.skills.map(skill => {
            const pts = evaluateSkillContext(skill.skillName);
            return {
                name: skill.skillName,
                matched: pts > 0,
                score: pts / 10 // Normalize to 0-1
            };
        });

        const result = evaluateGroupLogic(group.type, itemMatches);
        totalPoints += result.score * 10;
    }

    const score = maxPossiblePoints > 0 ? (totalPoints / maxPossiblePoints) * 100 : 0;
    return Math.min(Math.round(score), 100);
}

// ============================================================================
// Component 3: Resume Structure Score (20%)
// ============================================================================

/**
 * Check for presence of standard resume sections and proper formatting.
 * 
 * Checks:
 * - Skills section
 * - Experience section
 * - Education section
 * - Contact info (email)
 * - Reasonable length (300-1500 words)
 * 
 * @param resumeText - Full resume text
 * @param hasExperience - Whether experience data was extracted
 * @param hasEducation - Whether education data was extracted
 * @returns Score 0-100
 */
function calculateStructureScore(
    resumeText: string,
    hasExperience: boolean,
    hasEducation: boolean
): number {
    if (!resumeText) {
        return 0;
    }

    let score = 0;
    const lowerText = resumeText.toLowerCase();

    // Check for skills section
    const hasSkillsSection = /skills?[:|\s]/i.test(resumeText) ||
        /technical\s+skills/i.test(resumeText) ||
        /core\s+competencies/i.test(resumeText);
    if (hasSkillsSection) {
        score += STRUCTURE_POINTS.hasSkillsSection;
    }

    // Check for experience section (from extracted data or text patterns)
    if (hasExperience || /experience[:|\s]/i.test(resumeText) || /work\s+history/i.test(resumeText)) {
        score += STRUCTURE_POINTS.hasExperience;
    }

    // Check for education section
    if (hasEducation || /education[:|\s]/i.test(resumeText)) {
        score += STRUCTURE_POINTS.hasEducation;
    }

    // Check for contact info (email)
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
    if (hasEmail) {
        score += STRUCTURE_POINTS.hasContact;
    }

    // Check for proper length (300-1500 words)
    const wordCount = resumeText.split(/\s+/).length;
    if (wordCount >= 300 && wordCount <= 1500) {
        score += STRUCTURE_POINTS.properLength;
    }

    return Math.min(score, 100);
}

// ============================================================================
// Component 4: Impact Language Score (15%)
// ============================================================================

/**
 * Evaluate usage of action verbs and impact-oriented language.
 * 
 * Higher frequency of action verbs indicates achievement-focused resume.
 * 
 * @param resumeText - Full resume text
 * @returns Score 0-100
 */
function calculateImpactScore(resumeText: string): number {
    if (!resumeText) {
        return 0;
    }

    const lowerText = resumeText.toLowerCase();
    const words = lowerText.split(/\s+/);

    // Count action verb occurrences
    let actionVerbCount = 0;
    for (const verb of ACTION_VERBS) {
        const occurrences = (lowerText.match(new RegExp(`\\b${verb}\\b`, 'g')) || []).length;
        actionVerbCount += occurrences;
    }

    // Score based on density (action verbs per 100 words)
    const density = (actionVerbCount / words.length) * 100;

    // Scoring curve:
    // 0-1%: 0-30 points
    // 1-2%: 30-60 points
    // 2-3%: 60-85 points
    // 3%+: 85-100 points
    let score = 0;
    if (density >= 3) {
        score = 85 + Math.min((density - 3) * 5, 15);
    } else if (density >= 2) {
        score = 60 + (density - 2) * 25;
    } else if (density >= 1) {
        score = 30 + (density - 1) * 30;
    } else {
        score = density * 30;
    }

    return Math.min(Math.round(score), 100);
}

// ============================================================================
// Suggestion Generator
// ============================================================================

/**
 * Generate actionable suggestions based on score weaknesses.
 */
function generateSuggestions(
    breakdown: ATSScoreBreakdown,
    missingKeywords: string[]
): string[] {
    const suggestions: string[] = [];

    // Keyword relevance suggestions
    if (breakdown.relevance < 60) {
        if (missingKeywords.length > 0) {
            const topMissing = missingKeywords.slice(0, 5).join(', ');
            suggestions.push(`Add missing required skills to your resume: ${topMissing}`);
        }
        suggestions.push('Ensure all key skills from the job description appear in your resume');
    }

    // Context depth suggestions
    if (breakdown.contextDepth < 60) {
        suggestions.push('Expand project descriptions to provide more context for your skills');
        suggestions.push('Include specific examples of how you used each skill in your experience');
    }

    // Structure suggestions
    if (breakdown.structure < 60) {
        suggestions.push('Add clear section headers: Skills, Experience, Education');
        suggestions.push('Ensure your resume is between 300-1500 words for optimal length');
        suggestions.push('Include contact information with a professional email address');
    }

    // Impact language suggestions
    if (breakdown.impact < 50) {
        suggestions.push('Use strong action verbs: built, developed, implemented, optimized');
        suggestions.push('Quantify achievements with measurable results (e.g., "Reduced load time by 40%")');
        suggestions.push('Focus on impact and outcomes rather than just responsibilities');
    }

    // General suggestions if overall score is low
    if (breakdown.relevance + breakdown.contextDepth + breakdown.structure + breakdown.impact < 200) {
        if (breakdown.relevance === 0 && missingKeywords.length === 0) {
            suggestions.push('Ask an admin to configure skills for this role to see keyword matching');
        } else {
            suggestions.push('Review the job requirements and align your resume content accordingly');
        }
    }

    return suggestions;
}

// ============================================================================
// Main Service Function
// ============================================================================

/**
 * Calculate ATS compatibility score for a user's resume against their target role.
 * 
 * This function:
 * 1. Fetches user's active resume
 * 2. Fetches target role benchmarks
 * 3. Calculates 4 component scores
 * 4. Combines into weighted final score
 * 5. Generates improvement suggestions
 * 
 * @param userId - User ID
 * @param roleId - Target role ID
 * @returns ATS score result with breakdown and suggestions
 * @throws Error if resume or role not found
 */
export async function calculateATSScore(
    userId: string,
    roleId: string
): Promise<ATSScoreResult> {
    await connectDB();

    // 1. Fetch active resume
    let resume = await Resume.findOne({
        userId: new Types.ObjectId(userId),
        isActive: true,
    }).sort({ createdAt: -1 }); // Don't use lean so we can potentially save or use record

    if (!resume) {
        throw new Error('No active resume found. Please upload a resume first.');
    }

    // 🚀 SELF-HEALING: If resume exists but not parsed, try parsing it NOW
    if (resume.status !== 'completed' || !resume.extractedData?.rawText) {
        if (resume.status === 'failed') {
            throw new Error(`Resume processing failed: ${resume.parseError || 'Unknown error'}. Please try re-uploading.`);
        }

        // Try to trigger parse if not already processing, or as a last resort
        const { performResumeParsing } = await import('@/lib/services/resumeParser');
        try {
            console.log(`[atsScoring] Resume not parsed. Triggering immediate parse for ${resume._id}`);
            await performResumeParsing(resume, userId);

            // Re-fetch to get the newly extracted text
            resume = await Resume.findById(resume._id);
            if (!resume || resume.status !== 'completed') {
                throw new Error('Resume processing in progress. Please wait a moment.');
            }
        } catch (err) {
            throw new Error('Resume is still being processed. Please wait a few moments and try again.');
        }
    }

    // 2. Fetch role benchmarks
    const role = await Role.findById(roleId)
        .populate({
            path: 'benchmarks.skillId',
            model: 'Skill',
            select: 'name'
        })
        .populate({
            path: 'benchmarkGroups.skills.skillId',
            model: 'Skill',
            select: 'name'
        })
        .lean();

    if (!role) {
        throw new Error(`Role not found: ${roleId}`);
    }

    // 3. Extract benchmarks
    const benchmarks: ATSBenchmarkSkill[] = [];
    const benchmarkGroups: ATSBenchmarkGroup[] = [];

    // Track skills that are part of a group to avoid double-counting them as standalone
    const groupedSkillIds = new Set<string>();

    // Process benchmark groups FIRST
    for (const group of role.benchmarkGroups || []) {
        if (!group.isActive) continue;

        const groupSkills: { skillId: string; skillName: string }[] = [];

        for (const s of group.skills || []) {
            const skill = s.skillId as unknown as { _id: Types.ObjectId; name: string } | null;
            if (!skill || typeof skill === 'string' || !('name' in skill)) continue;

            const sId = skill._id.toString();
            groupSkills.push({
                skillId: sId,
                skillName: skill.name
            });
            groupedSkillIds.add(sId);
        }

        if (groupSkills.length > 0) {
            benchmarkGroups.push({
                name: group.name,
                type: group.type,
                weight: group.weight,
                required: group.required,
                skills: groupSkills
            });
        }
    }

    // Process direct benchmarks, EXCLUDING those already handled in groups
    for (const benchmark of role.benchmarks || []) {
        if (!benchmark.isActive) continue;

        const skill = benchmark.skillId as unknown as { _id: Types.ObjectId; name: string } | null;
        if (!skill || typeof skill === 'string' || !('name' in skill)) continue;

        const sId = skill._id.toString();
        // Skip if already in a group to respect AND/OR logic over standalone requirements
        if (groupedSkillIds.has(sId)) continue;

        benchmarks.push({
            skillId: sId,
            skillName: skill.name,
            weight: benchmark.weight,
            importance: benchmark.importance
        });
    }

    // 4. Calculate component scores
    if (!resume.extractedData || !resume.extractedData.rawText) {
        throw new Error('Resume text extraction failed. Please try re-uploading.');
    }

    const resumeText = resume.extractedData.rawText;
    const experienceText = resume.extractedData.experience
        ?.map((exp: any) => `${exp.title} ${exp.company} ${exp.duration}`)
        .join(' ');

    const { score: relevanceScore, missingKeywords } = calculateKeywordRelevance(
        resumeText,
        benchmarks,
        benchmarkGroups
    );

    const contextDepthScore = calculateContextDepth(
        resumeText,
        benchmarks,
        benchmarkGroups,
        experienceText || ''
    );

    const structureScore = calculateStructureScore(
        resumeText,
        (resume.extractedData.experience?.length || 0) > 0,
        (resume.extractedData.education?.length || 0) > 0
    );

    const impactScore = calculateImpactScore(resumeText);

    // 5. Calculate weighted final score
    const breakdown: ATSScoreBreakdown = {
        relevance: relevanceScore,
        contextDepth: contextDepthScore,
        structure: structureScore,
        impact: impactScore
    };

    const overallScore = Math.round(
        (breakdown.relevance * COMPONENT_WEIGHTS.relevance) +
        (breakdown.contextDepth * COMPONENT_WEIGHTS.contextDepth) +
        (breakdown.structure * COMPONENT_WEIGHTS.structure) +
        (breakdown.impact * COMPONENT_WEIGHTS.impact)
    );

    // 6. Generate suggestions
    const suggestions = generateSuggestions(breakdown, missingKeywords);

    // 7. Save to database
    const savedScore = await ATSScore.findOneAndUpdate(
        { userId, roleId },
        {
            overallScore,
            breakdown,
            missingKeywords,
            suggestions,
            calculatedAt: new Date()
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return {
        overallScore,
        breakdown,
        missingKeywords,
        suggestions,
        calculatedAt: savedScore.calculatedAt
    };
}

/**
 * Get the latest ATS score without recalculating.
 */
export async function getLatestATSScore(
    userId: string,
    roleId: string
): Promise<ATSScoreResult | null> {
    await connectDB();
    const result = await ATSScore.findOne({ userId, roleId }).lean();

    if (!result) return null;

    return {
        overallScore: result.overallScore,
        breakdown: result.breakdown,
        missingKeywords: result.missingKeywords,
        suggestions: result.suggestions,
        calculatedAt: result.calculatedAt
    };
}

// ============================================================================
// Quick Calculate for Active Target Role
// ============================================================================

/**
 * Calculate ATS score for user's active target role.
 * Convenience wrapper around calculateATSScore.
 */
export async function calculateATSScoreForActiveRole(
    userId: string
): Promise<ATSScoreResult | null> {
    await connectDB();

    const targetRole = await TargetRole.getActiveForUser(userId);
    if (!targetRole) {
        return null;
    }

    // Extract roleId - handle both ObjectId and populated role
    const roleId = typeof (targetRole as any).roleId === 'object' && '_id' in (targetRole as any).roleId
        ? (targetRole as any).roleId._id.toString()
        : String((targetRole as any).roleId);

    return calculateATSScore(userId, roleId);
}

/**
 * Get latest ATS score for user's active target role.
 */
export async function getLatestATSScoreForActiveRole(
    userId: string
): Promise<ATSScoreResult | null> {
    await connectDB();

    const targetRole = await TargetRole.getActiveForUser(userId);
    if (!targetRole) {
        return null;
    }

    // Extract roleId - handle both ObjectId and populated role
    const roleId = typeof (targetRole as any).roleId === 'object' && '_id' in (targetRole as any).roleId
        ? (targetRole as any).roleId._id.toString()
        : String((targetRole as any).roleId);

    return getLatestATSScore(userId, roleId);
}
