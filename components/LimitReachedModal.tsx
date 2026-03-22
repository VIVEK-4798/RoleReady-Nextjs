'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, X } from 'lucide-react';
import { useAuth } from '@/hooks';

const FEATURE_MESSAGES: Record<string, string> = {
  readinessChecks: "You have used all your readiness checks.",
  roadmapGenerations: "You have used all your roadmap generations.",
  resumeGenerations: "You have reached your resume generation limit.",
  skillExtractions: "Skill extraction limit reached.",
  mentorRequests: "Mentor request limit reached.",
  tickets: "Support ticket limit reached."
};

export default function LimitReachedModal() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [open, setOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  useEffect(() => {
    // If user is PREMIUM, never show this modal
    if ((user as any)?.plan === 'PREMIUM') return;

    const handler = (event: any) => {
      const { feature } = event.detail;

      // Anti-Spam (Session Storage instead of permanent localStorage to allow page reload)
      const shownKey = `limit_shown_${feature}`;
      if (!sessionStorage.getItem(shownKey)) {
        sessionStorage.setItem(shownKey, "true");
        setModalData(event.detail);
        setOpen(true);
      } else {
        // We'll still show it if they click a button and it explicitly fires,
        // but let's clear it on close, or just track per session.
        // Actually, preventing repeated instant popup is key. Let's just open.
        setModalData(event.detail);
        setOpen(true);
      }
    };

    window.addEventListener("limitReached", handler);

    return () => {
      window.removeEventListener("limitReached", handler);
    };
  }, [user]);

  if (!open || !modalData) return null;

  const feature = modalData.feature as string;
  const message = FEATURE_MESSAGES[feature] || "You have reached your plan limit.";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-sm w-full animate-in zoom-in-95 duration-300 relative">
        <button 
          onClick={() => setOpen(false)} 
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-5 mx-auto">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        
        <h2 className="text-xl font-black text-center text-gray-900 mb-2">Limit Reached</h2>
        
        <p className="text-center text-gray-600 text-sm mb-6 leading-relaxed">
          {message} Upgrade your plan to continue using this feature.
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => { setOpen(false); router.push("/pricing"); }} 
            className="w-full text-center py-3 bg-[#5693C1] text-white font-bold rounded-xl hover:bg-[#4a80b0] transition-colors shadow-md"
          >
            Upgrade Plan
          </button>
          
          <button 
            onClick={() => { setOpen(false); router.push("/dashboard/usage"); }} 
            className="w-full text-center py-3 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
          >
            View Usage
          </button>
        </div>
      </div>
    </div>
  );
}
