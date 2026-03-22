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
   * Month boundary reset
   */
  static async resetUsageIfNeeded(user: any) {
    const plan = (user.plan as keyof typeof PLAN_LIMITS) || 'FREE';
    const planConfig = PLAN_LIMITS[plan] as any;

    if (!planConfig.monthlyReset) return user.usage || {};

    const now = new Date();
    const usageResetDate = user.usageResetDate;

    if (!usageResetDate || now >= new Date(usageResetDate)) {
      const nextReset = new Date();
      nextReset.setMonth(nextReset.getMonth() + 1);

      const emptyUsage = {
        readinessChecksUsed: 0,
        roadmapGenerated: 0,
        resumeGenerated: 0,
        skillExtractionsUsed: 0,
        mentorRequestsUsed: 0,
        ticketsUsed: 0,
      };

      await User.findByIdAndUpdate(user._id, {
        $set: { usage: emptyUsage, usageResetDate: nextReset }
      });

      user.usage = emptyUsage;
      user.usageResetDate = nextReset;
    }

    return user.usage || {};
  }

  /**
   * Get Usage Status for generic UI
   */
  static async getUsageStatus(user: any) {
    const plan = (user.plan as keyof typeof PLAN_LIMITS) || 'FREE';
    const limits = PLAN_LIMITS[plan] as any;

    if (limits.unlimited) {
      return { unlimited: true, plan };
    }

    const usage = await this.resetUsageIfNeeded(user) || {};

    return {
      unlimited: false,
      plan,
      readinessChecks: {
        used: usage.readinessChecksUsed || 0,
        limit: limits.readinessChecks,
        remaining: limits.readinessChecks - (usage.readinessChecksUsed || 0),
      },
      roadmapGenerations: {
        used: usage.roadmapGenerated || 0,
        limit: limits.roadmapGenerations,
        remaining: limits.roadmapGenerations - (usage.roadmapGenerated || 0),
      },
      resumeGenerations: {
        used: usage.resumeGenerated || 0,
        limit: limits.resumeGenerations,
        remaining: limits.resumeGenerations - (usage.resumeGenerated || 0),
      },
      skillExtractions: {
        used: usage.skillExtractionsUsed || 0,
        limit: limits.skillExtractions,
        remaining: limits.skillExtractions - (usage.skillExtractionsUsed || 0),
      },
      mentorRequests: {
        used: usage.mentorRequestsUsed || 0,
        limit: limits.mentorRequests,
        remaining: limits.mentorRequests - (usage.mentorRequestsUsed || 0),
      },
      tickets: {
        used: usage.ticketsUsed || 0,
        limit: limits.tickets,
        remaining: limits.tickets - (usage.ticketsUsed || 0),
      }
    };
  }

  /**
   * Check if user can use a feature. Throws error if limit reached.
   */
  static async checkLimit(userId: string, feature: UsageFeature): Promise<void> {
    const user = await User.findById(userId).select('plan usage usageResetDate').lean();
    if (!user) throw new Error('User not found');

    const usageObj = await this.resetUsageIfNeeded(user);
    const plan = (user.plan as keyof typeof PLAN_LIMITS) || 'FREE';
    const planConfig = PLAN_LIMITS[plan] as any;

    if (planConfig.unlimited) {
      return; 
    }

    const limit = planConfig[feature];
    if (limit === undefined) return; // No limit specified means unlimited

    const usageField = UsageFeatureDBMap[feature] as keyof typeof user.usage;
    const currentUsage = usageObj?.[usageField] || 0;

    if (currentUsage >= limit) {
      throw new Error(JSON.stringify({
        type: "LIMIT_REACHED",
        feature,
      }));
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
