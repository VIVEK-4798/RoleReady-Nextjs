/**
 * Roadmap Generator Service
 * 
 * Generates personalized learning roadmaps from readiness gaps.
 * 
 * ============================================================================
 * PRIORITY ALGORITHM
 * ============================================================================
 * 
 * Steps are prioritized based on:
 * 
 * 1. IMPORTANCE (required vs optional):
 *    - Required skills get +100 priority points
 *    - This ensures required skills come before optional ones
 * 
 * 2. WEIGHT (1-10):
 *    - Higher weight = more important to the role
 *    - Directly added to priority
 * 
 * 3. GAP SIZE (levels needed × 10):
 *    - Bigger gaps might need earlier attention
 *    - Each level needed adds 10 priority points
 * 
 * 4. VALIDATION OPPORTUNITY:
 *    - Skills that are self-reported get a small boost
 *    - Getting them validated improves readiness score
 * 
 * ============================================================================
 * EFFORT ESTIMATION
 * ============================================================================
 * 
 * Estimated hours per level improvement:
 * - none → beginner:         20 hours (basics)
 * - beginner → intermediate: 40 hours (fundamentals)
 * - intermediate → advanced: 80 hours (deep learning)
 * - advanced → expert:      160 hours (mastery)
 * 
 * These are rough estimates and can be customized per skill category.
 * 
 * ============================================================================
 */

import { Types } from 'mongoose';
import type { SkillLevel, SkillSource, ValidationStatus } from '@/types';
import type { ReadinessResult, SkillReadinessBreakdown } from './readinessCalculator';
import type { StepType, IRoadmapStep } from '@/lib/models/Roadmap';

// ============================================================================
// Constants
// ============================================================================

/**
 * Estimated hours to improve one skill level
 */
const HOURS_PER_LEVEL: Record<string, number> = {
  'none_to_beginner': 20,
  'beginner_to_intermediate': 40,
  'intermediate_to_advanced': 80,
  'advanced_to_expert': 160,
};

/**
 * Level progression order
 */
const LEVEL_ORDER: SkillLevel[] = ['none', 'beginner', 'intermediate', 'advanced', 'expert'];

/**
 * Action descriptions templates
 */
const ACTION_TEMPLATES: Record<StepType, (skillName: string, targetLevel: SkillLevel) => string> = {
  learn_new: (skillName, targetLevel) =>
    `Start learning ${skillName} fundamentals and build up to ${targetLevel} level proficiency.`,
  improve: (skillName, targetLevel) =>
    `Deepen your ${skillName} knowledge through practice and study to reach ${targetLevel} level.`,
  validate: (skillName) =>
    `Request mentor validation for your ${skillName} skill to increase your readiness score.`,
};

/**
 * Suggested resources templates (placeholder - can be enhanced with actual resources)
 */
const RESOURCE_SUGGESTIONS: Record<string, string[]> = {
  default: [
    'Online courses (Coursera, Udemy, Pluralsight)',
    'Official documentation and tutorials',
    'Practice projects and coding challenges',
    'Community forums and discussion groups',
  ],
  programming: [
    'LeetCode for algorithm practice',
    'GitHub open source contributions',
    'Build personal projects',
    'Code review with peers',
  ],
  soft_skills: [
    'Books and audiobooks',
    'Workshops and webinars',
    'Mentorship sessions',
    'Real-world practice opportunities',
  ],
};

// ============================================================================
// Types
// ============================================================================

export interface GenerateRoadmapInput {
  userId: string;
  roleId: string;
  roleName: string;
  readinessResult: ReadinessResult;
  maxSteps?: number; // Limit number of steps (default: all gaps)
}

export interface GeneratedRoadmap {
  userId: string;
  roleId: string;
  title: string;
  description: string;
  steps: GeneratedStep[];
  totalEstimatedHours: number;
  readinessAtGeneration: number;
  projectedReadiness: number;
}

export interface GeneratedStep {
  skillId: string;
  skillName: string;
  stepType: StepType;
  importance: 'required' | 'optional';
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  levelsToImprove: number;
  priority: number;
  weight: number;
  estimatedHours: number;
  actionDescription: string;
  suggestedResources: string[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate estimated hours for a level progression
 */
function calculateEstimatedHours(currentLevel: SkillLevel, targetLevel: SkillLevel): number {
  const currentIndex = LEVEL_ORDER.indexOf(currentLevel);
  const targetIndex = LEVEL_ORDER.indexOf(targetLevel);
  
  if (targetIndex <= currentIndex) {
    return 0;
  }
  
  let totalHours = 0;
  
  for (let i = currentIndex; i < targetIndex; i++) {
    const fromLevel = LEVEL_ORDER[i];
    const toLevel = LEVEL_ORDER[i + 1];
    const key = `${fromLevel}_to_${toLevel}`;
    totalHours += HOURS_PER_LEVEL[key] || 40; // Default 40 hours per level
  }
  
  return totalHours;
}

/**
 * Determine the step type based on current state
 */
function determineStepType(
  currentLevel: SkillLevel,
  source: SkillSource | null,
  validationStatus: ValidationStatus | null
): StepType {
  // If skill is missing entirely, it's a learn_new step
  if (currentLevel === 'none') {
    return 'learn_new';
  }
  
  // If skill is self-reported and not validated, suggest validation
  if (source === 'self' && validationStatus !== 'validated') {
    return 'validate';
  }
  
  // Otherwise, it's an improvement step
  return 'improve';
}

/**
 * Calculate priority score for a skill gap
 */
function calculatePriority(
  importance: 'required' | 'optional',
  weight: number,
  levelsNeeded: number,
  isUnvalidated: boolean
): number {
  let priority = 0;
  
  // Required skills get highest priority
  priority += importance === 'required' ? 100 : 0;
  
  // Weight adds to priority (1-10)
  priority += weight;
  
  // Gap size (levels needed × 10)
  priority += levelsNeeded * 10;
  
  // Small boost for unvalidated skills (encourages validation)
  priority += isUnvalidated ? 5 : 0;
  
  return priority;
}

/**
 * Get suggested resources based on skill/category
 * Can be enhanced to pull from a resources database
 */
function getSuggestedResources(skillName: string): string[] {
  // For now, return default resources
  // This can be enhanced to categorize skills and return specific resources
  const lowerName = skillName.toLowerCase();
  
  if (lowerName.includes('communication') || 
      lowerName.includes('leadership') || 
      lowerName.includes('teamwork')) {
    return RESOURCE_SUGGESTIONS.soft_skills;
  }
  
  if (lowerName.includes('javascript') || 
      lowerName.includes('python') || 
      lowerName.includes('java') ||
      lowerName.includes('programming') ||
      lowerName.includes('coding')) {
    return RESOURCE_SUGGESTIONS.programming;
  }
  
  return RESOURCE_SUGGESTIONS.default;
}

/**
 * Calculate projected readiness after completing all steps
 * This is an estimate based on reaching target levels
 */
function calculateProjectedReadiness(
  currentPercentage: number,
  breakdown: SkillReadinessBreakdown[],
  steps: GeneratedStep[]
): number {
  // If no steps, readiness stays the same
  if (steps.length === 0) {
    return currentPercentage;
  }
  
  // Get total max possible score
  const maxPossibleScore = breakdown.reduce((sum, b) => sum + b.maxPossibleScore, 0);
  if (maxPossibleScore === 0) {
    return 100;
  }
  
  // Calculate current total score
  const currentTotalScore = breakdown.reduce((sum, b) => sum + b.weightedScore, 0);
  
  // Calculate potential gain from completing steps
  // Assume completing a step means reaching target level with validation
  let potentialGain = 0;
  
  for (const step of steps) {
    // Find the breakdown item for this skill
    const breakdownItem = breakdown.find((b) => b.skillId === step.skillId);
    if (!breakdownItem) continue;
    
    // Calculate score at target level (assume validated = 1.0 multiplier)
    const levelPoints: Record<SkillLevel, number> = {
      'none': 0,
      'beginner': 25,
      'intermediate': 50,
      'advanced': 75,
      'expert': 100,
    };
    
    const targetPoints = levelPoints[step.targetLevel];
    const targetScore = targetPoints * 1.0 * step.weight; // Validated multiplier
    
    // Add the difference to potential gain
    potentialGain += targetScore - breakdownItem.weightedScore;
  }
  
  // Calculate projected percentage
  const projectedTotalScore = currentTotalScore + potentialGain;
  const projectedPercentage = Math.round((projectedTotalScore / maxPossibleScore) * 100);
  
  // Cap at 100%
  return Math.min(projectedPercentage, 100);
}

// ============================================================================
// Main Generator Function
// ============================================================================

/**
 * Generate a personalized roadmap from readiness results
 * 
 * This is a PURE FUNCTION - it takes readiness data and returns a roadmap.
 * It does NOT write to the database.
 */
export function generateRoadmap(input: GenerateRoadmapInput): GeneratedRoadmap {
  const { userId, roleId, roleName, readinessResult, maxSteps } = input;
  
  const steps: GeneratedStep[] = [];
  
  // Process each skill in the breakdown that needs improvement
  for (const item of readinessResult.breakdown) {
    // Skip skills that already meet requirements
    if (item.meetsRequirement && item.validationStatus === 'validated') {
      continue;
    }
    
    // Determine what type of step this is
    const stepType = determineStepType(
      item.userLevel,
      item.source,
      item.validationStatus
    );
    
    // For validation steps, target is same level (just getting validated)
    const targetLevel = stepType === 'validate' 
      ? item.userLevel 
      : item.requiredLevel;
    
    // Calculate levels to improve
    const currentIndex = LEVEL_ORDER.indexOf(item.userLevel);
    const targetIndex = LEVEL_ORDER.indexOf(targetLevel);
    const levelsToImprove = Math.max(0, targetIndex - currentIndex);
    
    // Skip if no improvement needed (except validation steps)
    if (levelsToImprove === 0 && stepType !== 'validate') {
      continue;
    }
    
    // Calculate priority
    const isUnvalidated = item.source === 'self' && item.validationStatus !== 'validated';
    const priority = calculatePriority(
      item.importance,
      item.weight,
      levelsToImprove,
      isUnvalidated
    );
    
    // Calculate estimated hours
    const estimatedHours = stepType === 'validate'
      ? 2 // Validation just takes a review session
      : calculateEstimatedHours(item.userLevel, targetLevel);
    
    // Generate action description
    const actionDescription = ACTION_TEMPLATES[stepType](item.skillName, targetLevel);
    
    // Get suggested resources
    const suggestedResources = stepType === 'validate'
      ? ['Schedule a mentor validation session', 'Prepare examples of your work']
      : getSuggestedResources(item.skillName);
    
    steps.push({
      skillId: item.skillId,
      skillName: item.skillName,
      stepType,
      importance: item.importance,
      currentLevel: item.userLevel,
      targetLevel,
      levelsToImprove,
      priority,
      weight: item.weight,
      estimatedHours,
      actionDescription,
      suggestedResources,
    });
  }
  
  // Sort by priority (highest first)
  steps.sort((a, b) => b.priority - a.priority);
  
  // Limit steps if maxSteps is specified
  const limitedSteps = maxSteps ? steps.slice(0, maxSteps) : steps;
  
  // Calculate totals
  const totalEstimatedHours = limitedSteps.reduce((sum, s) => sum + s.estimatedHours, 0);
  
  // Calculate projected readiness
  const projectedReadiness = calculateProjectedReadiness(
    readinessResult.percentage,
    readinessResult.breakdown,
    limitedSteps
  );
  
  return {
    userId,
    roleId,
    title: `Roadmap to ${roleName}`,
    description: `Your personalized learning path to become a ${roleName}. ` +
      `Complete these ${limitedSteps.length} steps to improve your readiness from ` +
      `${readinessResult.percentage}% to an estimated ${projectedReadiness}%.`,
    steps: limitedSteps,
    totalEstimatedHours,
    readinessAtGeneration: readinessResult.percentage,
    projectedReadiness,
  };
}
