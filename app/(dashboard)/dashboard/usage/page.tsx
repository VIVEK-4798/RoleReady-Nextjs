import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';
import { PLAN_LIMITS } from '@/lib/config/pricing';
import { UsageService } from '@/lib/services/usageService';
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
  
  if (planName === 'PREMIUM') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Plan & Usage</h1>
          <div className="mb-8 p-4 bg-green-50 rounded-xl flex items-center justify-between border border-green-200">
             <div>
                <p className="text-sm text-green-700 font-medium uppercase tracking-wider mb-1">Current Plan</p>
                <p className="text-xl font-black text-green-800">Premium Plan</p>
             </div>
             <p className="text-green-800 font-medium">You have unlimited access to all features</p>
          </div>
        </div>
      </div>
    );
  }

  const usageStatus = await UsageService.getUsageStatus(user);
  
  const features = [
    { key: 'readinessChecks', label: 'Readiness Checks', data: usageStatus.readinessChecks },
    { key: 'roadmapGenerations', label: 'Roadmap Generations', data: usageStatus.roadmapGenerations },
    { key: 'resumeGenerations', label: 'Resume Generations', data: usageStatus.resumeGenerations },
    { key: 'skillExtractions', label: 'Skill Extractions', data: usageStatus.skillExtractions },
    { key: 'mentorRequests', label: 'Mentor Requests', data: usageStatus.mentorRequests },
    { key: 'tickets', label: 'Support Tickets', data: usageStatus.tickets },
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
             if (!feat.data) return null;
             
             const percentage = Math.min(100, (feat.data.used / feat.data.limit) * 100);
             const remaining = Math.max(0, feat.data.limit - feat.data.used);
             const remainingRatio = remaining / feat.data.limit;
             
             let colorClass = 'bg-[#5693C1]'; // Green (Safe) alternative or default
             let textClass = 'text-[#5693C1]';
             let bgLightClass = 'bg-blue-50';
             
             if (percentage >= 100) {
               colorClass = 'bg-red-500';
               textClass = 'text-red-600';
               bgLightClass = 'bg-red-50';
             } else if (remainingRatio <= 0.3) {
               colorClass = 'bg-yellow-500';
               textClass = 'text-yellow-600';
               bgLightClass = 'bg-yellow-50';
             } else {
               colorClass = 'bg-green-500';
               textClass = 'text-green-700';
               bgLightClass = 'bg-green-50';
             }

             return (
               <div key={feat.key} className={`border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${percentage >= 100 ? 'border-red-200' : 'border-gray-100'}`}>
                 <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{feat.label}</h3>
                    {percentage >= 100 ? (
                       <span className="text-xs font-bold px-2 py-1 bg-red-50 text-red-600 rounded-md">Limit Reached</span>
                    ) : (
                       <span className={`text-xs font-bold px-2 py-1 rounded-md ${bgLightClass} ${textClass}`}>
                         You have {remaining} {feat.label.toLowerCase()} left
                       </span>
                    )}
                 </div>

                 <div className="space-y-4 relative z-10">
                   <div className="flex justify-between text-sm mb-1">
                     <span className="text-gray-500 font-medium">
                       {feat.data.used} / {feat.data.limit} {feat.label.toLowerCase()} used {planName === 'PRO' ? 'this month' : ''}
                     </span>
                   </div>
                   <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className={`h-full ${colorClass}`} style={{ width: `${percentage}%` }} />
                   </div>
                   
                   {percentage >= 100 && (
                      <div className="mt-4 pt-4 border-t border-red-100">
                        <p className="text-red-700 font-medium text-sm mb-3">Limit reached. Upgrade to continue</p>
                        <Link href="/pricing" className="block w-full text-center px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm">
                           Upgrade
                        </Link>
                      </div>
                   )}
                 </div>
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
}
