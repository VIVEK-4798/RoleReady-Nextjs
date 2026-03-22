import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';
import { PLAN_LIMITS } from '@/lib/config/pricing';
import UsageAlertsClient from './UsageAlertsClient';

export default async function UsageAlerts() {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();
  const user = await User.findById(session.user.id).select('plan usage').lean();
  if (!user) return null;

  const planName = (user.plan || 'FREE') as keyof typeof PLAN_LIMITS;
  if (planName === 'PREMIUM') return null;

  const limits = PLAN_LIMITS[planName] as any;
  const usage = (user.usage || {}) as any;

  const getRatio = (used: number, limit: number) => {
     if (!limit) return 1;
     return Math.max(0, limit - used) / limit;
  };

  const readinessRatio = getRatio(usage.readinessChecksUsed || 0, limits.readinessChecks);
  const roadmapRatio = getRatio(usage.roadmapGenerated || 0, limits.roadmapGenerations);
  const mentorRatio = getRatio(usage.mentorRequestsUsed || 0, limits.mentorRequests);
  const minRatio = Math.min(readinessRatio, roadmapRatio, mentorRatio);

  const isDanger = minRatio <= 0.2;
  const isExhausted = minRatio === 0;

  if (!isDanger) return null;

  return (
    <UsageAlertsClient isExhausted={isExhausted} planName={planName} />
  );
}
