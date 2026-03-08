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
 * 1. SKILL LEVEL SCORING (0-1 scale per skill):
 *    - none:         0.00
 *    - beginner:     0.25
 *    - intermediate: 0.50
 *    - advanced:     0.75
 *    - expert:       1.00
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
 *    Skill Score = (Level Score × Validation Multiplier) × Benchmark Weight
 *    
 *    Example: Intermediate skill (0.5) that's validated (1.0) with weight 25:
 *    Score = (0.5 × 1.0) × 25 = 12.5 out of 25 possible points
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
 *    - maxPossibleScore = sum of all weights (typically equals 100)
 * 
 * ============================================================================
 */

import type { SkillLevel, ValidationStatus, SkillSource } from '@/types';
import { evaluateGroupLogic, ItemMatch } from '@/lib/utils/evaluation';

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

export interface BenchmarkGroupInput {
  name: string;
  type: 'ALL_REQUIRED' | 'ANY_ONE_REQUIRED';
  weight: number;
  required: boolean;
  skills: {
    skillId: string;
    skillName: string;
    requiredLevel: SkillLevel;
  }[];
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
  groupName?: string;
  groupType?: 'ALL_REQUIRED' | 'ANY_ONE_REQUIRED';
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

  // Group results
  groupResults?: {
    name: string;
    type: 'ALL_REQUIRED' | 'ANY_ONE_REQUIRED';
    score: number;
    maxScore: number;
    satisfied: boolean;
  }[];

  // Metadata
  calculatedAt: Date;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Points assigned to each skill level (0-1 scale)
 */
export const LEVEL_POINTS: Record<SkillLevel, number> = {
  'none': 0,
  'beginner': 0.25,
  'intermediate': 0.5,
  'advanced': 0.75,
  'expert': 1,
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
  userSkills: UserSkillInput[],
  benchmarkGroups: BenchmarkGroupInput[] = []
): ReadinessResult {
  console.log('[calculateReadiness] ===== STARTING CALCULATION =====');
  console.log('[calculateReadiness] Role:', roleName);
  console.log('[calculateReadiness] Benchmarks count:', benchmarks.length);
  console.log('[calculateReadiness] Groups count:', benchmarkGroups.length);
  console.log('[calculateReadiness] User skills count:', userSkills.length);

  // Create a map of user skills by skillId for O(1) lookup
  const userSkillMap = new Map<string, UserSkillInput>();
  for (const skill of userSkills) {
    userSkillMap.set(skill.skillId, skill);
  }

  // Trackers
  const breakdown: SkillReadinessBreakdown[] = [];
  const groupResults: {
    name: string;
    type: 'ALL_REQUIRED' | 'ANY_ONE_REQUIRED';
    score: number;
    maxScore: number;
    satisfied: boolean;
  }[] = [];

  let totalScore = 0;
  let maxPossibleScore = 0;
  let requiredItemsMet = 0;
  let requiredItemsTotal = 0;
  let skillsMatchedCount = 0;
  let skillsMissingCount = 0;

  // Track skills that are part of a group to avoid double-counting them as standalone
  const groupedSkillIds = new Set<string>();
  for (const group of benchmarkGroups) {
    if (!group.skills) continue;
    for (const skillItem of group.skills) {
      groupedSkillIds.add(skillItem.skillId);
    }
  }

  // 1. Process Flat Benchmarks (Backward Compatibility)
  for (const benchmark of benchmarks) {
    // Skip if this skill is already part of a group to respect group AND/OR logic
    if (groupedSkillIds.has(benchmark.skillId)) continue;

    const userSkill = userSkillMap.get(benchmark.skillId);
    const isMissing = !userSkill;

    const userLevel: SkillLevel = userSkill?.level || 'none';
    const levelPoints = LEVEL_POINTS[userLevel];
    const validationMultiplier = getValidationMultiplier(
      userSkill?.source || null,
      userSkill?.validationStatus || null
    );

    const rawScore = levelPoints * validationMultiplier;
    const weightedScore = rawScore * benchmark.weight;
    const maxForThisSkill = benchmark.weight;

    const meets = meetsLevelRequirement(userLevel, benchmark.requiredLevel);

    // Track required status
    if (benchmark.importance === 'required') {
      requiredItemsTotal++;
      if (meets && !isMissing) {
        requiredItemsMet++;
      }
    }

    // Track counts
    if (isMissing || userLevel === 'none') {
      skillsMissingCount++;
    } else {
      skillsMatchedCount++;
    }

    totalScore += weightedScore;
    maxPossibleScore += maxForThisSkill;

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

  // 2. Process Benchmark Groups
  for (const group of benchmarkGroups) {
    const skillCount = group.skills.length;
    if (skillCount === 0) continue;

    const itemMatches: ItemMatch[] = group.skills.map(skillItem => {
      const userSkill = userSkillMap.get(skillItem.skillId);
      const isMissing = !userSkill;
      const userLevel: SkillLevel = userSkill?.level || 'none';
      const levelPoints = LEVEL_POINTS[userLevel];
      const validationMultiplier = getValidationMultiplier(
        userSkill?.source || null,
        userSkill?.validationStatus || null
      );

      const rawScore = levelPoints * validationMultiplier;
      const meets = meetsLevelRequirement(userLevel, skillItem.requiredLevel);

      // Track counts
      if (isMissing || userLevel === 'none') {
        skillsMissingCount++;
      } else {
        skillsMatchedCount++;
      }

      return {
        name: skillItem.skillName,
        matched: meets && !isMissing,
        score: rawScore
      };
    });

    const evalResult = evaluateGroupLogic(group.type, itemMatches);
    const groupWeightScore = evalResult.score * group.weight;

    totalScore += groupWeightScore;
    maxPossibleScore += group.weight;

    if (group.required) {
      requiredItemsTotal++;
      if (evalResult.satisfied) {
        requiredItemsMet++;
      }
    }

    // Add to breakdown
    group.skills.forEach((skillItem, index) => {
      const match = itemMatches[index];
      const userSkill = userSkillMap.get(skillItem.skillId);
      const relativeWeight = group.weight / skillCount;

      breakdown.push({
        skillId: skillItem.skillId,
        skillName: skillItem.skillName,
        importance: group.required ? 'required' : 'optional',
        weight: relativeWeight,
        requiredLevel: skillItem.requiredLevel,
        userLevel: userSkill?.level || 'none',
        levelPoints: LEVEL_POINTS[userSkill?.level || 'none'],
        validationMultiplier: getValidationMultiplier(userSkill?.source || null, userSkill?.validationStatus || null),
        rawScore: match.score,
        weightedScore: match.score * relativeWeight,
        maxPossibleScore: relativeWeight,
        // If it's an OR group and it's satisfied, we mark members as "meeting" requirement 
        // for UI display unless the group is failing.
        meetsRequirement: group.type === 'ANY_ONE_REQUIRED' ? (evalResult.satisfied || match.matched) : match.matched,
        isMissing: !userSkill,
        source: userSkill?.source || null,
        validationStatus: userSkill?.validationStatus || null,
        groupName: group.name,
        groupType: group.type
      });
    });

    groupResults.push({
      name: group.name,
      type: group.type,
      score: groupWeightScore,
      maxScore: group.weight,
      satisfied: evalResult.satisfied
    });
  }

  // Calculate final percentage
  const percentage = maxPossibleScore > 0
    ? Math.round((totalScore / maxPossibleScore) * 100 * 10) / 10
    : 0;

  // Check if all required items are met
  const hasAllRequired = requiredItemsMet === requiredItemsTotal;

  return {
    userId,
    roleId,
    roleName,
    totalScore: Math.round(totalScore * 10) / 10,
    maxPossibleScore,
    percentage,
    hasAllRequired,
    requiredSkillsMet: requiredItemsMet,
    requiredSkillsTotal: requiredItemsTotal,
    totalBenchmarks: benchmarks.length + breakdown.length - benchmarks.length,
    skillsMatched: skillsMatchedCount,
    skillsMissing: skillsMissingCount,
    breakdown,
    groupResults,
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
  const processedGroups = new Set<string>();

  for (const item of result.breakdown) {
    // Handle ANY_ONE_REQUIRED groups
    if (item.groupName && item.groupType === 'ANY_ONE_REQUIRED') {
      if (processedGroups.has(item.groupName)) continue;

      const groupResult = result.groupResults?.find(g => g.name === item.groupName);
      if (groupResult && !groupResult.satisfied) {
        // Group not satisfied, suggest all options in one gap entry
        const groupSkills = result.breakdown.filter(b => b.groupName === item.groupName);
        const skillNames = groupSkills.map(s => s.skillName).join(', ');

        gaps.push({
          skillId: `group:${item.groupName}`,
          skillName: `Add at least one of the following: ${skillNames}`,
          currentLevel: 'none',
          requiredLevel: groupSkills[0].requiredLevel, // Use first as proxy
          importance: item.importance,
          levelsNeeded: 1,
          priority: (item.importance === 'required' ? 105 : 5) + (item.weight || 0),
        });
        processedGroups.add(item.groupName);
      }
      continue;
    }

    // Handle normal benchmarks or ALL_REQUIRED group skills
    if (!item.meetsRequirement) {
      const currentRank = LEVEL_RANK[item.userLevel];
      const requiredRank = LEVEL_RANK[item.requiredLevel];
      const levelsNeeded = requiredRank - currentRank;

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
