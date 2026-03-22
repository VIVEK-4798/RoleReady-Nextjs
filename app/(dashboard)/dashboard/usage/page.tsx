import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';
import { PLAN_LIMITS } from '@/lib/config/pricing';
import Link from 'next/link';

export const metadata = {
  title: 'My Usage | RoleReady',
};

export default async function UsagePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  await connectDB();
  const user = await User.findById(session.user.id).lean();
  if (!user) redirect('/login');

  const planName = (user.plan || 'FREE') as keyof typeof PLAN_LIMITS;
  const limits = PLAN_LIMITS[planName] as any;
  const usage = user.usage as any || {};

  const features = [
    { key: 'readinessChecks', label: 'Readiness Checks', used: usage.readinessChecksUsed || 0, limit: limits.readinessChecks },
    { key: 'roadmapGenerations', label: 'Roadmap Generations', used: usage.roadmapGenerated || 0, limit: limits.roadmapGenerations },
    { key: 'resumeGenerations', label: 'Resume Generations', used: usage.resumeGenerated || 0, limit: limits.resumeGenerations },
    { key: 'skillExtractions', label: 'Skill Extractions', used: usage.skillExtractionsUsed || 0, limit: limits.skillExtractions },
    { key: 'mentorRequests', label: 'Mentor Requests', used: usage.mentorRequestsUsed || 0, limit: limits.mentorRequests },
    { key: 'tickets', label: 'Support Tickets', used: usage.ticketsUsed || 0, limit: limits.tickets },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Plan & Usage</h1>
        <p className="text-gray-500 mb-6">Track your free benefits and upgrade when you're ready.</p>
        
        <div className="mb-8 p-4 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
           <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Current Plan</p>
              <p className="text-xl font-black text-[#5693C1]">{planName} Plan</p>
           </div>
           {planName === 'FREE' && (
             <Link href="/pricing" className="px-6 py-2.5 bg-[#5693C1] text-white font-bold rounded-lg hover:bg-[#4a80b0] transition-colors shadow-sm">
                Upgrade to Pro
             </Link>
           )}
           {planName === 'PRO' && (
             <Link href="/pricing" className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
                Upgrade to Premium
             </Link>
           )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat) => {
             const isUnlimited = limits.unlimited || feat.limit === undefined;
             const percentage = isUnlimited ? 0 : Math.min(100, (feat.used / feat.limit) * 100);
             const remaining = isUnlimited ? 'Unlimited' : Math.max(0, feat.limit - feat.used);

             return (
               <div key={feat.key} className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                 <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{feat.label}</h3>
                    {isUnlimited ? (
                       <span className="text-xs font-bold px-2 py-1 bg-green-50 text-green-700 rounded-md">Unlimited</span>
                    ) : (feat.used >= feat.limit ? (
                       <span className="text-xs font-bold px-2 py-1 bg-red-50 text-red-600 rounded-md">Limit Reached</span>
                    ) : (
                       <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-[#5693C1] rounded-md">{remaining} left</span>
                    ))}
                 </div>

                 {!isUnlimited && (
                   <div className="space-y-2 relative z-10">
                     <div className="flex justify-between text-sm mb-2">
                       <span className="text-gray-500 font-medium">
                         {feat.used} / {feat.limit} {feat.label.toLowerCase()} used {planName === 'PRO' ? 'this month' : ''}
                       </span>
                     </div>
                     <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                       <div className={`h-full ${percentage >= 100 ? 'bg-red-500' : 'bg-[#5693C1]'}`} style={{ width: `${percentage}%` }} />
                     </div>
                   </div>
                 )}
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
}
