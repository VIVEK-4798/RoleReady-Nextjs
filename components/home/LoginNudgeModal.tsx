'use client';

import { useRouter } from 'next/navigation';
import { Target, X } from 'lucide-react';

interface LoginNudgeModalProps {
  onClose: () => void;
}

export default function LoginNudgeModal({ onClose }: LoginNudgeModalProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full animate-in zoom-in-95 duration-300 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Target className="w-8 h-8 text-[#5693C1]" />
        </div>
        
        <h2 className="text-2xl font-black text-center text-gray-900 mb-3">
          Start Tracking Your Readiness
        </h2>
        
        <p className="text-center text-gray-600 text-base mb-8 leading-relaxed px-4">
          You're exploring RoleReady. Sign up to track your progress, generate your personalized roadmap, and unlock your free benefits.
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => {
              onClose();
              router.push("/auth/signin");
            }} 
            className="w-full text-center py-3.5 bg-[#5693C1] text-white font-bold rounded-xl hover:bg-[#4a80b0] transition-colors shadow-md text-lg"
          >
            Sign Up / Login
          </button>
          
          <button 
            onClick={onClose} 
            className="w-full text-center py-3 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Continue Exploring
          </button>
        </div>
      </div>
    </div>
  );
}
