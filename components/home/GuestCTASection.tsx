/**
 * Guest Call To Action Section
 * 
 * CTA section for non-authenticated users.
 * Migrated from CallToActions component in the old React project.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const phrases = ["Empower your career with", "Boost your skills with", "Achieve more with"];

export default function GuestCTASection() {
  const [activeText, setActiveText] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveText((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(86,147,193,0.1)_0%,transparent_70%)] animate-pulse" />
      <div className="absolute bottom-[20%] left-[10%] w-[200px] h-[200px] rounded-full bg-[radial-gradient(circle,rgba(86,147,193,0.1)_0%,transparent_70%)] animate-pulse delay-1000" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-4xl lg:text-[2.5rem] font-bold leading-tight text-slate-800 mb-6 max-w-[800px]">
            <span className="inline-block w-[280px] md:w-[380px] text-left h-[40px] md:h-[60px] overflow-hidden relative">
              {phrases.map((phrase, index) => (
                <span 
                  key={index}
                  className={`absolute top-0 left-0 whitespace-nowrap transition-all duration-600 ease-out ${
                    index === activeText 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-5'
                  }`}
                >
                  {phrase}
                </span>
              ))}
            </span>
            <span className="text-[#5693C1] inline-block relative ml-2.5">
              RoleReady
              <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-[#5693C1]/40 to-[#5693C1]/10 rounded-sm" />
            </span>
          </h2>

          <p className="text-slate-600 text-base mb-10 max-w-[600px]">
            By continuing, you agree to our T&C.
          </p>

          <div className="flex flex-wrap gap-5 justify-center">
            <Link
              href="/login"
              className="bg-[#5693C1] text-white border-none px-10 py-[18px] rounded-full text-base font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(86,147,193,0.4)] flex items-center hover:bg-[#457fa8] hover:-translate-y-0.5"
            >
              Sign In
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </Link>

            <Link
              href="/signup"
              className="bg-transparent text-[#5693C1] border-2 border-[#5693C1] px-10 py-[18px] rounded-full text-base font-semibold cursor-pointer transition-all duration-300 flex items-center hover:bg-[#5693C1]/10 hover:-translate-y-0.5"
            >
              Register
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
