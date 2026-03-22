import { User } from '@/lib/models';
import { PLAN_LIMITS } from '@/lib/config/pricing';

export type UsageFeature = 
  | 'readinessChecks'
  | 'roadmapGenerations'
  | 'resumeGenerations'
  | 'skillExtractions'
  | 'mentorRequests'
  | 'tickets';

export const UsageFeatureDBMap: Record<UsageFeature, string> = {
  readinessChecks: 'readinessChecksUsed',
  roadmapGenerations: 'roadmapGenerated',
  resumeGenerations: 'resumeGenerated',
  skillExtractions: 'skillExtractionsUsed',
  mentorRequests: 'mentorRequestsUsed',
  tickets: 'ticketsUsed',
};

export class UsageService {
  /**
   * Check if user can use a feature. Throws error if limit reached.
   */
  static async checkLimit(userId: string, feature: UsageFeature): Promise<void> {
    const user = await User.findById(userId).select('plan usage usageResetDate').lean();
    if (!user) throw new Error('User not found');

    let usageObj = user.usage as any;
    let usageResetDate = (user as any).usageResetDate;
    const plan = (user.plan as keyof typeof PLAN_LIMITS) || 'FREE';
    const planConfig = PLAN_LIMITS[plan] as any;

    // Monthly Reset Logic for PRO
    if (planConfig.monthlyReset) {
       const now = new Date();
       if (!usageResetDate || now >= new Date(usageResetDate)) {
         // Create a date exactly 1 month from now
         const nextReset = new Date();
         nextReset.setMonth(nextReset.getMonth() + 1);

         // Reset usage counters
         usageObj = {
           readinessChecksUsed: 0,
           roadmapGenerated: 0,
           resumeGenerated: 0,
           skillExtractionsUsed: 0,
           mentorRequestsUsed: 0,
           ticketsUsed: 0,
         };

         await User.findByIdAndUpdate(userId, {
           $set: { usage: usageObj, usageResetDate: nextReset }
         });
       }
    }
    if (!user) throw new Error('User not found');

    if (planConfig.unlimited) {
      return; 
    }

    const limit = planConfig[feature];
    if (limit === undefined) return; // No limit specified means unlimited

    const usageField = UsageFeatureDBMap[feature] as keyof typeof user.usage;
    const currentUsage = usageObj?.[usageField] || 0;

    if (currentUsage >= limit) {
      if (plan === 'PRO') {
         throw new Error(`You've reached your monthly limit. Upgrade to Premium for unlimited access.`);
      }
      throw new Error(`Free limit reached. Upgrade to continue.`);
    }
  }

  /**
   * Increment usage for a feature.
   */
  static async incrementUsage(userId: string, feature: UsageFeature): Promise<void> {
    const usageField = UsageFeatureDBMap[feature];
    await User.findByIdAndUpdate(userId, {
      $inc: { [`usage.${usageField}`]: 1 },
    });
  }

  /**
   * Check AND increment in one go
   */
  static async enforceAndIncrement(userId: string, feature: UsageFeature): Promise<void> {
    await this.checkLimit(userId, feature);
    await this.incrementUsage(userId, feature);
  }
}
