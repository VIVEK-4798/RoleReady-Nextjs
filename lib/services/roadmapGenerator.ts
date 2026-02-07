/**
 * Roadmap Generator Service with 5-Rule Priority System
 * 
 * Generates personalized learning roadmaps from readiness gaps using deterministic rules.
 * 
 * ============================================================================
 * 5-RULE PRIORITY SYSTEM (matches old project)
 * ============================================================================
 * 
 * RULE_1: Missing Required Skills → HIGH priority
 *   - Required skills with level = 'none'
 *   - Priority score: 80 + (weight × 5)
 *   - Category: required_gap
 * 
 * RULE_2: Rejected Skills → HIGH priority
 *   - Skills with validationStatus = 'rejected'
 *   - Priority score: 70 + (weight × 5)
 *   - Category: rejected
 * 
 * RULE_3: Unvalidated Required Skills → MEDIUM priority
 *   - Required skills that user has but mentor hasn't validated
 *   - Priority score: 50 + (weight × 3)
 *   - Category: required_gap
 * 
 * RULE_4: Optional Missing Skills → LOW priority
 *   - Optional skills with level = 'none'
 *   - Priority score: 20 + (weight × 2)
 *   - Category: optional_gap
 * 
 * RULE_5: Validated & Met Skills → EXCLUDED
 *   - Skills that meet requirements and are validated
 *   - Not included in roadmap
 * 
 * ============================================================================
 */

import { Types } from 'mongoose';
import type { SkillLevel, SkillSource, ValidationStatus } from '@/types';
import type { ReadinessResult, SkillReadinessBreakdown } from './readinessCalculator';
import type { StepType, IRoadmapStep } from '@/lib/models/Roadmap';

// ============================================================================
// Types
// ============================================================================

export type RoadmapPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type RoadmapCategory = 'required_gap' | 'optional_gap' | 'strengthen' | 'rejected';
export type RoadmapRule = 'RULE_1_REQUIRED_MISSING' | 'RULE_2_REJECTED' | 'RULE_3_UNVALIDATED_REQUIRED' | 'RULE_4_OPTIONAL_MISSING' | 'RULE_5_VALIDATED_MET';

export interface GenerateRoadmapInput {
  userId: string;
  roleId: string;
  roleName: string;
  readinessResult: ReadinessResult;
  maxSteps?: number;
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
  priority: number; // Simple 1-5 for UI (1=highest)
  weight: number;
  estimatedHours: number;
  actionDescription: string;
  suggestedResources: string[];
  
  // Enhanced fields from old project
  reason: string;
  priorityLabel: RoadmapPriority;
  category: RoadmapCategory;
  confidence: string;
  priorityScore: number;
  ruleApplied: RoadmapRule;
}

// ============================================================================
// Constants
// ============================================================================

const HOURS_PER_LEVEL: Record<string, number> = {
  'none_to_beginner': 20,
  'beginner_to_intermediate': 40,
  'intermediate_to_advanced': 80,
  'advanced_to_expert': 160,
};

const LEVEL_ORDER: SkillLevel[] = ['none', 'beginner', 'intermediate', 'advanced', 'expert'];

const RESOURCE_SUGGESTIONS: Record<string, string[]> = {
  default: [
    'Online courses (Coursera, Udemy, Pluralsight)',
    'Official documentation and tutorials',
    'Practice projects and coding challenges',
    'Community forums and discussion groups',
  ],
};

// ============================================================================
// Helper Functions
// ============================================================================

function calculateEstimatedHours(currentLevel: SkillLevel, targetLevel: SkillLevel): number {
  const currentIndex = LEVEL_ORDER.indexOf(currentLevel);
  const targetIndex = LEVEL_ORDER.indexOf(targetLevel);
  
  if (targetIndex <= currentIndex) return 0;
  
  let totalHours = 0;
  for (let i = currentIndex; i < targetIndex; i++) {
    const fromLevel = LEVEL_ORDER[i];
    const toLevel = LEVEL_ORDER[i + 1];
    const key = `${fromLevel}_to_${toLevel}`;
    totalHours += HOURS_PER_LEVEL[key] || 40;
  }
  
  return totalHours;
}

function getConfidenceLabel(source: SkillSource | null, validationStatus: ValidationStatus | null): string {
  if (validationStatus === 'validated') return 'validated';
  if (validationStatus === 'rejected') return 'rejected';
  if (source === 'self') return 'unvalidated';
  return 'unvalidated';
}

/**
 * Apply the 5-rule system to determine priority, category, and reason
 */
function applyRules(item: SkillReadinessBreakdown, roleName: string): {
  rule: RoadmapRule;
  priorityLabel: RoadmapPriority;
  priorityScore: number;
  category: RoadmapCategory;
  reason: string;
  include: boolean;
} {
  const { skillName, importance, userLevel, validationStatus, source, weight } = item;
  
  // RULE_5: Validated & Met Skills → EXCLUDED
  if (item.meetsRequirement && validationStatus === 'validated') {
    return {
      rule: 'RULE_5_VALIDATED_MET',
      priorityLabel: 'LOW',
      priorityScore: 0,
      category: 'required_gap',
      reason: `${skillName} is validated and meets requirements`,
      include: false,
    };
  }
  
  // RULE_2: Rejected Skills → HIGH priority
  if (validationStatus === 'rejected') {
    return {
      rule: 'RULE_2_REJECTED',
      priorityLabel: 'HIGH',
      priorityScore: 70 + (weight * 5),
      category: 'rejected',
      reason: `${skillName} was rejected by mentor validation — needs improvement for ${roleName}`,
      include: true,
    };
  }
  
  // RULE_1: Missing Required Skills → HIGH priority
  if (importance === 'required' && userLevel === 'none') {
    return {
      rule: 'RULE_1_REQUIRED_MISSING',
      priorityLabel: 'HIGH',
      priorityScore: 80 + (weight * 5),
      category: 'required_gap',
      reason: `${skillName} is required for ${roleName} but missing from your profile`,
      include: true,
    };
  }
  
  // RULE_3: Unvalidated Required Skills → MEDIUM priority
  if (importance === 'required' && source === 'self' && validationStatus !== 'validated') {
    return {
      rule: 'RULE_3_UNVALIDATED_REQUIRED',
      priorityLabel: 'MEDIUM',
      priorityScore: 50 + (weight * 3),
      category: 'required_gap',
      reason: `${skillName} is required for ${roleName} but not yet validated by a mentor`,
      include: true,
    };
  }
  
  // RULE_4: Optional Missing Skills → LOW priority
  if (importance === 'optional' && userLevel === 'none') {
    return {
      rule: 'RULE_4_OPTIONAL_MISSING',
      priorityLabel: 'LOW',
      priorityScore: 20 + (weight * 2),
      category: 'optional_gap',
      reason: `${skillName} is optional for ${roleName} — would boost your score if added`,
      include: true,
    };
  }
  
  // Default: Include as strengthen if they have the skill but need improvement
  if (userLevel !== 'none' && !item.meetsRequirement) {
    return {
      rule: importance === 'required' ? 'RULE_3_UNVALIDATED_REQUIRED' : 'RULE_4_OPTIONAL_MISSING',
      priorityLabel: importance === 'required' ? 'MEDIUM' : 'LOW',
      priorityScore: importance === 'required' ? (50 + weight * 3) : (25 + weight * 2),
      category: 'strengthen',
      reason: `Improve your ${skillName} skills to meet ${roleName} requirements`,
      include: true,
    };
  }
  
  // Exclude by default
  return {
    rule: 'RULE_5_VALIDATED_MET',
    priorityLabel: 'LOW',
    priorityScore: 0,
    category: 'required_gap',
    reason: `${skillName} meets requirements`,
    include: false,
  };
}

/**
 * Determine step type based on current state
 */
function determineStepType(
  currentLevel: SkillLevel,
  targetLevel: SkillLevel,
  rule: RoadmapRule
): StepType {
  if (currentLevel === 'none') return 'learn';
  if (rule === 'RULE_3_UNVALIDATED_REQUIRED') return 'validate';
  if (currentLevel !== targetLevel) return 'practice';
  return 'master';
}
  
// ============================================================================
// Main Generator Function
// ============================================================================

/**
 * Generate a personalized roadmap using the 5-rule priority system
 */
export function generateRoadmap(input: GenerateRoadmapInput): GeneratedRoadmap {
  const { userId, roleId, roleName, readinessResult, maxSteps } = input;
  
  console.log('[generateRoadmap] Starting generation for role:', roleName);
  console.log('[generateRoadmap] Breakdown items:', readinessResult.breakdown.length);
  console.log('[generateRoadmap] Sample breakdown:', readinessResult.breakdown.slice(0, 3).map(b => ({
    skill: b.skillName,
    userLevel: b.userLevel,
    required: b.requiredLevel,
    importance: b.importance,
    source: b.source,
    validationStatus: b.validationStatus
  })));
  
  const steps: GeneratedStep[] = [];
  
  // Apply 5-rule system to each skill in breakdown
  for (const item of readinessResult.breakdown) {
    const ruleResult = applyRules(item, roleName);
    
    console.log(`[generateRoadmap] ${item.skillName}: rule=${ruleResult.rule}, priority=${ruleResult.priorityLabel}, include=${ruleResult.include}`);
    
    // Skip excluded skills (RULE_5)
    if (!ruleResult.include) {
      continue;
    }
    
    // Calculate levels to improve
    const currentIndex = LEVEL_ORDER.indexOf(item.userLevel);
    const targetIndex = LEVEL_ORDER.indexOf(item.requiredLevel);
    const levelsToImprove = Math.max(0, targetIndex - currentIndex);
    
    // Determine step type
    const stepType = determineStepType(item.userLevel, item.requiredLevel, ruleResult.rule);
    
    // Calculate estimated hours
    const estimatedHours = stepType === 'validate'
      ? 2 // Validation session
      : calculateEstimatedHours(item.userLevel, item.requiredLevel);
    
    // Action description
    const actionDescription = ruleResult.reason;
    
    // Get confidence label
    const confidence = getConfidenceLabel(item.source, item.validationStatus);
    
    // Convert priority label to number (1=highest, 5=lowest)
    const priorityNum = ruleResult.priorityLabel === 'HIGH' ? 1 
                      : ruleResult.priorityLabel === 'MEDIUM' ? 2 
                      : 3;
    
    steps.push({
      skillId: item.skillId,
      skillName: item.skillName,
      stepType,
      importance: item.importance,
      currentLevel: item.userLevel,
      targetLevel: item.requiredLevel,
      levelsToImprove,
      priority: priorityNum,
      weight: item.weight,
      estimatedHours,
      actionDescription,
      suggestedResources: RESOURCE_SUGGESTIONS.default,
      
      // Enhanced fields
      reason: ruleResult.reason,
      priorityLabel: ruleResult.priorityLabel,
      category: ruleResult.category,
      confidence,
      priorityScore: ruleResult.priorityScore,
      ruleApplied: ruleResult.rule,
    });
  }
  
  console.log('[generateRoadmap] Generated', steps.length, 'steps before limiting');
  
  // Sort by priority score (highest first)
  steps.sort((a, b) => b.priorityScore - a.priorityScore);
  
  // Limit steps if maxSteps specified
  const limitedSteps = maxSteps ? steps.slice(0, maxSteps) : steps;
  
  console.log('[generateRoadmap] Final step count:', limitedSteps.length);
  
  // Calculate totals
  const totalEstimatedHours = limitedSteps.reduce((sum, s) => sum + s.estimatedHours, 0);
  
  // Calculate projected readiness (simplified - assume completing all steps = 100%)
  const currentPercentage = readinessResult.percentage;
  const hasHighPriority = limitedSteps.some(s => s.priorityLabel === 'HIGH');
  const projectedGain = hasHighPriority ? (100 - currentPercentage) * 0.7 : (100 - currentPercentage) * 0.5;
  const projectedReadiness = Math.min(100, Math.round(currentPercentage + projectedGain));
  
  return {
    userId,
    roleId,
    title: `Learning Roadmap for ${roleName}`,
    description: `Prioritized skill development plan based on your ${currentPercentage}% readiness. ` +
      `Complete these ${limitedSteps.length} action items to improve your readiness score.`,
    steps: limitedSteps,
    totalEstimatedHours,
    readinessAtGeneration: currentPercentage,
    projectedReadiness,
  };
}