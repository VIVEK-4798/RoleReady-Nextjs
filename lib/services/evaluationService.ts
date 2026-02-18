import { Types } from 'mongoose';
import connectDB from '@/lib/db/mongoose';
import User from '@/lib/models/User';

export type EvaluationType = 'readiness' | 'roadmap' | 'ats' | 'report';

/**
 * Mark specific evaluation types as outdated for a user.
 * 
 * @param userId - The user's ID
 * @param types - Array of evaluation types to mark outdated
 */
export async function markEvaluationsOutdated(
    userId: string,
    types: EvaluationType[] = ['readiness', 'roadmap', 'ats', 'report']
): Promise<void> {
    await connectDB();

    const updates: Record<string, boolean> = {};

    if (types.includes('readiness')) updates['evaluationState.readinessOutdated'] = true;
    if (types.includes('roadmap')) updates['evaluationState.roadmapOutdated'] = true;
    if (types.includes('ats')) updates['evaluationState.atsOutdated'] = true;
    if (types.includes('report')) updates['evaluationState.reportOutdated'] = true;

    await User.findByIdAndUpdate(userId, {
        $set: updates
    });
}

/**
 * Reset the outdated flag for a specific evaluation type and update the last calculated timestamp.
 * 
 * @param userId - The user's ID
 * @param type - The evaluation type to reset
 */
export async function markEvaluationComplete(
    userId: string,
    type: EvaluationType
): Promise<void> {
    await connectDB();

    const updates: Record<string, any> = {};

    switch (type) {
        case 'readiness':
            updates['evaluationState.readinessOutdated'] = false;
            updates['evaluationState.lastReadinessCalculatedAt'] = new Date();
            break;
        case 'roadmap':
            updates['evaluationState.roadmapOutdated'] = false;
            updates['evaluationState.lastRoadmapGeneratedAt'] = new Date();
            break;
        case 'ats':
            updates['evaluationState.atsOutdated'] = false;
            updates['evaluationState.lastATSCalculatedAt'] = new Date();
            break;
        case 'report':
            updates['evaluationState.reportOutdated'] = false;
            break;
    }

    await User.findByIdAndUpdate(userId, {
        $set: updates
    });
}

/**
 * Get the current evaluation state for a user.
 */
export async function getEvaluationState(userId: string) {
    await connectDB();

    const user = await User.findById(userId).select('evaluationState').lean();
    return user?.evaluationState;
}
