'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Info, X } from 'lucide-react';

export default function UsageAlertsClient({ isExhausted, planName }: { isExhausted: boolean; planName: string }) {
  const [showModal, setShowModal] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasSeenModal = sessionStorage.getItem('hasSeenLimitModal');
    if (!hasSeenModal) {
      setShowModal(true);
      sessionStorage.setItem('hasSeenLimitModal', 'true');
    }
  }, []);

  if (!mounted) return null;

  return (
    <>
      {showBanner && (
        <div className={`mb-6 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border ${isExhausted ? 'bg-red-50 border-red-200 text-red-800' : 'bg-orange-50 border-orange-200 text-orange-800'}`}>
          <div className="flex items-start md:items-center gap-3">
            <div className="flex-shrink-0 mt-0.5 md:mt-0">
              {isExhausted ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <Info className="w-5 h-5 text-orange-600" />}
            </div>
            <p className="font-medium text-sm leading-snug">
               {isExhausted 
                 ? (planName === 'PRO' ? "You've reached your monthly limit. Upgrade to Premium for unlimited access." : "You've used all free benefits. Upgrade to continue improving.") 
                 : "You're running out of free benefits. Upgrade to continue improving."}
            </p>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto mt-2 md:mt-0">
             <Link href="/pricing" className={`flex-1 md:flex-none text-center px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors ${isExhausted ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}>
               Upgrade to {planName === 'PRO' ? 'Premium' : 'Pro'}
             </Link>
             <button onClick={() => setShowBanner(false)} className="text-current hover:opacity-75 rounded-full p-2 transition-opacity flex-shrink-0">
                <X className="w-5 h-5" />
             </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-sm w-full animate-in zoom-in-95 duration-300 relative">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400">
                 <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-5 mx-auto">
                 <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-black text-center text-gray-900 mb-2">You've reached your limit</h2>
              <p className="text-center text-gray-600 text-sm mb-6 leading-relaxed">
                 {planName === 'PRO' 
                   ? "You've reached your monthly limit. Upgrade to Premium for unlimited access to all features." 
                   : "You've used all free readiness checks. Upgrade to Pro to unlock generous monthly limits, roadmap generation, and mentor validations."}
              </p>
              <Link onClick={() => setShowModal(false)} href="/pricing" className="block w-full text-center py-3 bg-[#5693C1] text-white font-bold rounded-xl hover:bg-[#4a80b0] transition-colors shadow-md">
                 Upgrade to {planName === 'PRO' ? 'Premium' : 'Pro'}
              </Link>
              <button onClick={() => setShowModal(false)} className="block w-full text-center mt-3 py-2 text-gray-500 font-semibold text-sm hover:bg-gray-50 rounded-lg transition-colors">
                 Maybe Later
              </button>
           </div>
        </div>
      )}
    </>
  );
}
