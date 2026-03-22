'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function UsageWidget() {
  const [usageStatus, setUsageStatus] = useState<any>(null);

  useEffect(() => {
    fetch('/api/usage')
      .then(res => res.json())
      .then(data => setUsageStatus(data))
      .catch(console.error);
  }, []);

  if (!usageStatus) {
    return (
       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full animate-pulse">
         <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
         <div className="flex-1 space-y-4">
           <div className="h-4 bg-gray-200 rounded w-full"></div>
           <div className="h-4 bg-gray-200 rounded w-full"></div>
         </div>
       </div>
    );
  }

  if (usageStatus.unlimited) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Usage Summary</h2>
        <div className="flex-1 flex items-center justify-center p-4 bg-green-50 border border-green-100 rounded-lg">
           <p className="text-green-800 font-medium text-center">Unlimited access to all features</p>
        </div>
        <Link href="/dashboard/usage" className="block text-center mt-6 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg transition-colors border border-gray-200">
           View Details
        </Link>
      </div>
    );
  }

  const features = [
    { label: 'Readiness', data: usageStatus.readinessChecks },
    { label: 'Resume', data: usageStatus.resumeGenerations },
    { label: 'Mentor', data: usageStatus.mentorRequests },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Usage Summary</h2>
      
      <div className="space-y-4 flex-1">
        {features.map(feat => {
           if (!feat.data) return null;
           
           const percentage = Math.min(100, (feat.data.used / feat.data.limit) * 100);
           const isDanger = percentage >= 80;
           
           return (
             <div key={feat.label} className="space-y-1.5">
               <div className="flex justify-between text-sm">
                 <span className="font-medium text-gray-700">{feat.label}</span>
                 <span className={`${isDanger ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                   {feat.data.used}/{feat.data.limit}
                 </span>
               </div>
               <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                 <div className={`h-full ${isDanger ? 'bg-red-500' : 'bg-[#5693C1]'}`} style={{ width: `${percentage}%` }} />
               </div>
             </div>
           );
        })}
      </div>

      <Link href="/dashboard/usage" className="block text-center mt-6 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg transition-colors border border-gray-200">
         View Details
      </Link>
    </div>
  );
}
