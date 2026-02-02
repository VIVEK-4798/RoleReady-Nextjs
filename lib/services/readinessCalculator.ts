/**
 * Readiness Calculation Engine
 * 
 * PURE FUNCTION: This module calculates readiness without any database writes.
 * It takes user skills and role benchmarks as input and returns a derived score.
 * 
 * ============================================================================
 * FORMULA EXPLANATION
 * ============================================================================
 * 
 * Readiness is calculated based on how well a user's skills match a role's
 * benchmark requirements.
 * 
 * 1. SKILL LEVEL SCORING (0-100 scale per skill):
 *    - none:         0 points
 *    - beginner:    25 points
 *    - intermediate: 50 points
 *    - advanced:    75 points
 *    - expert:     100 points
 * 
 * 2. LEVEL MATCH SCORING:
 *    - If user level >= required level: Full points (based on user level)
 *    - If user level < required level: Partial points (penalized)
 *    - Missing skill (user doesn't have it): 0 points
 * 
 * 3. VALIDATION MULTIPLIER:
 *    Skills gain credibility based on their source/validation:
 *    - validated:  1.0x (100% - mentor confirmed)
 *    - self:       0.8x (80% - self-reported, not verified)
 *    - resume:     0.7x (70% - extracted, needs confirmation)
 *    
 *    This encourages users to get skills validated by mentors.
 * 
 * 4. WEIGHT APPLICATION:
 *    Each benchmark has a weight (1-10). Higher weights mean more important skills.
 *    
 *    Skill Score = (Level Points × Validation Multiplier) × Benchmark Weight
 * 
 * 5. REQUIRED VS OPTIONAL:
 *    - REQUIRED skills: If ANY required skill is at level 'none' or missing,
 *      the user is flagged as "not meeting requirements" (hasAllRequired = false)
 *    - OPTIONAL skills: Contribute to score but don't block readiness
 * 
 * 6. FINAL PERCENTAGE:
 *    readinessPercentage = (totalScore / maxPossibleScore) × 100
 *    
 *    Where:
 *    - totalScore = sum of all weighted skill scores
 *    - maxPossibleScore = sum of (100 × weight) for all benchmarks
 * 
 * ============================================================================
 */

import type { SkillLevel, ValidationStatus, SkillSource } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface BenchmarkInput {
  skillId: string;
  skillName: string;
  importance: 'required' | 'optional';
  weight: number;
  requiredLevel: SkillLevel;
}

export interface UserSkillInput {
  skillId: string;
  skillName: string;
  level: SkillLevel;
  source: SkillSource;
  validationStatus: ValidationStatus;
}

export interface SkillReadinessBreakdown {
  skillId: string;
  skillName: string;
  importance: 'required' | 'optional';
  weight: number;
  requiredLevel: SkillLevel;
  userLevel: SkillLevel;
  levelPoints: number;
  validationMultiplier: number;
  rawScore: number;          // levelPoints × validationMultiplier
  weightedScore: number;     // rawScore × weight
  maxPossibleScore: number;  // 100 × weight
  meetsRequirement: boolean; // userLevel >= requiredLevel
  isMissing: boolean;        // User doesn't have this skill
  source: SkillSource | null;
  validationStatus: ValidationStatus | null;
}

export interface ReadinessResult {
  userId: string;
  roleId: string;
  roleName: string;
  
  // Summary scores
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  
  // Requirement status
  hasAllRequired: boolean;
  requiredSkillsMet: number;
  requiredSkillsTotal: number;
  
  // Breakdown counts
  totalBenchmarks: number;
  skillsMatched: number;
  skillsMissing: number;
  
  // Detailed breakdown per skill
  breakdown: SkillReadinessBreakdown[];
  
  // Metadata
  calculatedAt: Date;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Points assigned to each skill level (0-100 scale)
 */
export const LEVEL_POINTS: Record<SkillLevel, number> = {
  'none': 0,
  'beginner': 25,
  'intermediate': 50,
  'advanced': 75,
  'expert': 100,
};

/**
 * Numeric rank for level comparison
 */
const LEVEL_RANK: Record<SkillLevel, number> = {
  'none': 0,
  'beginner': 1,
  'intermediate': 2,
  'advanced': 3,
  'expert': 4,
};

/**
 * Multiplier based on skill source and validation status
 * Validated skills are worth more than unvalidated ones
 */
export const VALIDATION_MULTIPLIERS: Record<string, number> = {
  'validated': 1.0,    // Mentor-confirmed: full credit
  'self': 0.8,         // Self-reported: 80% credit
  'resume': 0.7,       // Resume-extracted: 70% credit (needs confirmation)
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the validation multiplier for a skill based on source and validation status
 */
function getValidationMultiplier(
  source: SkillSource | null,
  validationStatus: ValidationStatus | null
): number {
  // If validated by mentor, use full multiplier regardless of source
  if (validationStatus === 'validated') {
    return VALIDATION_MULTIPLIERS['validated'];
  }
  
  // Otherwise, use source-based multiplier
  if (source && source in VALIDATION_MULTIPLIERS) {
    return VALIDATION_MULTIPLIERS[source];
  }
  
  // Default for missing skills
  return 0;
}

/**
 * Check if user level meets or exceeds required level
 */
function meetsLevelRequirement(
  userLevel: SkillLevel,
  requiredLevel: SkillLevel
): boolean {
  return LEVEL_RANK[userLevel] >= LEVEL_RANK[requiredLevel];
}

// ============================================================================
// Main Calculation Function (PURE - NO SIDE EFFECTS)
// ============================================================================

/**
 * Calculate readiness score for a user against a role's benchmarks.
 * 
 * This is a PURE FUNCTION:
 * - Takes inputs, returns outputs
 * - No database reads or writes
 * - No side effects
 * - Deterministic: same inputs always produce same outputs
 * 
 * @param userId - The user's ID
 * @param roleId - The role's ID
 * @param roleName - The role's name (for display)
 * @param benchmarks - The role's skill benchmarks
 * @param userSkills - The user's claimed/validated skills
 * @returns ReadinessResult with scores and breakdown
 */
export function calculateReadiness(
  userId: string,
  roleId: string,
  roleName: string,
  benchmarks: BenchmarkInput[],
  userSkills: UserSkillInput[]
): ReadinessResult {
  // Create a map of user skills by skillId for O(1) lookup
  const userSkillMap = new Map<string, UserSkillInput>();
  for (const skill of userSkills) {
    userSkillMap.set(skill.skillId, skill);
  }
  
  // Calculate breakdown for each benchmark
  const breakdown: SkillReadinessBreakdown[] = [];
  let totalScore = 0;
  let maxPossibleScore = 0;
  let requiredSkillsMet = 0;
  let requiredSkillsTotal = 0;
  let skillsMatched = 0;
  let skillsMissing = 0;
  
  for (const benchmark of benchmarks) {
    const userSkill = userSkillMap.get(benchmark.skillId);
    const isMissing = !userSkill;
    
    // Get user's level (default to 'none' if missing)
    const userLevel: SkillLevel = userSkill?.level || 'none';
    const levelPoints = LEVEL_POINTS[userLevel];
    
    // Get validation multiplier
    const validationMultiplier = getValidationMultiplier(
      userSkill?.source || null,
      userSkill?.validationStatus || null
    );
    
    // Calculate scores
    const rawScore = levelPoints * validationMultiplier;
    const weightedScore = rawScore * benchmark.weight;
    const maxForThisSkill = 100 * benchmark.weight; // Max is 100 points × weight
    
    // Check if requirement is met
    const meets = meetsLevelRequirement(userLevel, benchmark.requiredLevel);
    
    // Track required skills
    if (benchmark.importance === 'required') {
      requiredSkillsTotal++;
      if (meets && !isMissing) {
        requiredSkillsMet++;
      }
    }
    
    // Track matched vs missing
    if (isMissing || userLevel === 'none') {
      skillsMissing++;
    } else {
      skillsMatched++;
    }
    
    // Accumulate totals
    totalScore += weightedScore;
    maxPossibleScore += maxForThisSkill;
    
    // Add to breakdown
    breakdown.push({
      skillId: benchmark.skillId,
      skillName: benchmark.skillName,
      importance: benchmark.importance,
      weight: benchmark.weight,
      requiredLevel: benchmark.requiredLevel,
      userLevel,
      levelPoints,
      validationMultiplier,
      rawScore,
      weightedScore,
      maxPossibleScore: maxForThisSkill,
      meetsRequirement: meets,
      isMissing,
      source: userSkill?.source || null,
      validationStatus: userSkill?.validationStatus || null,
    });
  }
  
  // Calculate final percentage (avoid division by zero)
  const percentage = maxPossibleScore > 0
    ? Math.round((totalScore / maxPossibleScore) * 100 * 10) / 10 // Round to 1 decimal
    : 0;
  
  // Check if all required skills are met
  const hasAllRequired = requiredSkillsMet === requiredSkillsTotal;
  
  return {
    userId,
    roleId,
    roleName,
    totalScore: Math.round(totalScore * 10) / 10,
    maxPossibleScore,
    percentage,
    hasAllRequired,
    requiredSkillsMet,
    requiredSkillsTotal,
    totalBenchmarks: benchmarks.length,
    skillsMatched,
    skillsMissing,
    breakdown,
    calculatedAt: new Date(),
  };
}

// ============================================================================
// Utility: Get Skills Gap (what user needs to improve)
// ============================================================================

export interface SkillGap {
  skillId: string;
  skillName: string;
  currentLevel: SkillLevel;
  requiredLevel: SkillLevel;
  importance: 'required' | 'optional';
  levelsNeeded: number; // How many levels to improve
  priority: number;     // Higher = more urgent (required skills first)
}

/**
 * Extract skills that need improvement from a readiness result
 */
export function getSkillGaps(result: ReadinessResult): SkillGap[] {
  const gaps: SkillGap[] = [];
  
  for (const item of result.breakdown) {
    // Only include skills that don't meet requirements
    if (!item.meetsRequirement) {
      const currentRank = LEVEL_RANK[item.userLevel];
      const requiredRank = LEVEL_RANK[item.requiredLevel];
      const levelsNeeded = requiredRank - currentRank;
      
      // Priority: required skills have higher priority, weighted by levels needed
      const importanceBonus = item.importance === 'required' ? 100 : 0;
      const priority = importanceBonus + (levelsNeeded * 10) + item.weight;
      
      gaps.push({
        skillId: item.skillId,
        skillName: item.skillName,
        currentLevel: item.userLevel,
        requiredLevel: item.requiredLevel,
        importance: item.importance,
        levelsNeeded,
        priority,
      });
    }
  }
  
  // Sort by priority (highest first)
  return gaps.sort((a, b) => b.priority - a.priority);
}
