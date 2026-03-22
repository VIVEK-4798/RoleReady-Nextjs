'use client';

import { useState, useEffect } from 'react';
import { ArrowDown, Gift } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function UsagePlansTrigger() {
  const [show, setShow] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      // Hide if they scroll down near the section to prevent redundancy
      const usageSection = document.getElementById('usage-plans');
      if (usageSection) {
        const top = usageSection.getBoundingClientRect().top;
        if (top < window.innerHeight) {
          setShow(false);
        } else {
          setShow(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Only show on root layout/landing
  if (pathname !== '/') return null;

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <button 
        onClick={() => document.getElementById('usage-plans')?.scrollIntoView({ behavior: 'smooth' })}
        className="flex items-center gap-2 bg-white text-gray-900 border border-gray-200 shadow-xl hover:shadow-2xl px-5 py-3 rounded-full font-bold text-sm transition-all hover:-translate-y-1 group"
      >
        <span className="w-8 h-8 rounded-full bg-[#5693C1]/10 flex items-center justify-center -ml-2 text-[#5693C1]">
          <Gift className="w-4 h-4" />
        </span>
        See all free benefits
        <ArrowDown className="w-4 h-4 text-gray-400 group-hover:text-[#5693C1] transition-colors" />
      </button>
    </div>
  );
}
