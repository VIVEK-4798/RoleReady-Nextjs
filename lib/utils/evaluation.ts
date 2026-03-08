/**
 * Logic evaluation utility for skill groups and requirements.
 * Used by ATS Scoring and Readiness engines to ensure consistent AND/OR behavior.
 */

export type GroupType = 'ALL_REQUIRED' | 'ANY_ONE_REQUIRED';

export interface ItemMatch {
    name: string;
    matched: boolean;
    score: number; // Normalized 0-1 score for this individual item
}

export interface GroupEvaluationResult {
    satisfied: boolean;
    score: number; // Normalized 0-1 score for the group
    missingNames: string[];
}

/**
 * Evaluates a group of items based on its requirement type (AND vs OR).
 * 
 * Rules:
 * - ANY_ONE_REQUIRED (OR): 
 *      - Satisfied if >= 1 item matches.
 *      - Score = score of the best matching item.
 *      - Missing items = empty if satisfied, otherwise all items in group.
 * 
 * - ALL_REQUIRED (AND):
 *      - Satisfied if ALL items match.
 *      - Score = average score of all items in group.
 *      - Missing items = only those that didn't match.
 */
export function evaluateGroupLogic(
    type: GroupType,
    itemMatches: ItemMatch[]
): GroupEvaluationResult {
    if (!itemMatches || itemMatches.length === 0) {
        return { satisfied: true, score: 0, missingNames: [] };
    }

    if (type === 'ANY_ONE_REQUIRED') {
        const satisfied = itemMatches.some(m => m.matched);

        // Find best score among matches
        let bestScore = 0;
        if (itemMatches.length > 0) {
            bestScore = Math.max(...itemMatches.map(m => m.score));
        }

        return {
            satisfied,
            score: bestScore,
            // If at least one is matched, the group is not missing anything
            missingNames: satisfied ? [] : itemMatches.map(m => m.name)
        };
    } else {
        // ALL_REQUIRED (AND)
        const satisfied = itemMatches.every(m => m.matched);

        const totalScore = itemMatches.reduce((sum, m) => sum + m.score, 0);
        const avgScore = totalScore / itemMatches.length;

        return {
            satisfied,
            score: avgScore,
            // Only items that didn't match are missing
            missingNames: itemMatches.filter(m => !m.matched).map(m => m.name)
        };
    }
}
