'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Gift } from 'lucide-react';

export default function LandingUsagePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if shown before in this session
    const hasSeenPopup = sessionStorage.getItem('hasSeenFreeUsagePopup');
    if (hasSeenPopup) return;

    // Show after 2 seconds OR after scroll
    const timer = setTimeout(() => {
      setIsVisible(true);
      sessionStorage.setItem('hasSeenFreeUsagePopup', 'true');
    }, 2000);

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
        sessionStorage.setItem('hasSeenFreeUsagePopup', 'true');
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(timer);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  if (!mounted || !isVisible) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center sm:bottom-6 sm:right-6 sm:left-auto z-50">
  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 w-full max-w-sm mx-4 sm:mx-0 relative">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[#5693C1]">
            <Gift className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900">Explore Your Usage</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 pr-4 leading-relaxed">
          See what you can do for free before upgrading. Keep track of your limits effortlessly.
        </p>
        
        <Link 
          href="/dashboard/usage"
          className="block w-full text-center py-2.5 bg-[#5693C1] text-white font-bold rounded-xl text-sm hover:bg-[#4a80b0] transition-colors shadow-sm"
        >
          View Free Benefits →
        </Link>
      </div>
    </div>
  );
}
