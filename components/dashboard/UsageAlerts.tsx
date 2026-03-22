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

  const checksLimit = limits.readinessChecks || 3;
  const checksUsed = usage.readinessChecksUsed || 0;
  const remainingChecks = Math.max(0, checksLimit - checksUsed);

  return (
    <UsageAlertsClient remainingChecks={remainingChecks} planName={planName} />
  );
}
