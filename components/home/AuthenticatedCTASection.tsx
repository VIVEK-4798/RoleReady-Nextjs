/**
 * Authenticated User Call To Action Section
 * 
 * CTA section for logged-in users.
 * Migrated from NewCallToActions component in the old React project.
 */

'use client';

import Link from 'next/link';

const features = [
  { 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Check Readiness', 
    desc: 'Instantly assess your current level for target roles' 
  },
  { 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'Identify Gaps', 
    desc: 'Discover exact skills you need to improve' 
  },
  { 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Clear Path', 
    desc: 'Get personalized steps to reach your goals' 
  }
];

export default function AuthenticatedCTASection() {
  return (
    <section className="py-24 md:py-32 px-5 md:px-8 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-[100px] -right-[100px] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(86,147,193,0.15)_0%,transparent_70%)] z-[1]" />
      <div className="absolute -bottom-[150px] -left-[100px] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(86,147,193,0.1)_0%,transparent_70%)] z-[1]" />

      <div className="max-w-[1200px] mx-auto relative z-[2] text-center">
        <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
          Start Preparing{' '}
          <span className="text-[#5693C1] relative inline-block">
            Smarter
            <span className="absolute bottom-2 left-0 w-full h-3 bg-[#5693C1]/25 rounded -z-[1]" />
          </span>
          , Not Harder
        </h1>

        <p className="text-lg md:text-[22px] text-slate-600 max-w-[700px] mx-auto mb-16 leading-relaxed">
          Check your readiness, identify skill gaps, and get a clear improvement path before applying.
        </p>

        {/* Primary Actions */}
        <div className="flex flex-wrap gap-6 justify-center mb-20">
          <Link
            href="/dashboard"
            className="px-10 md:px-12 py-5 text-lg font-semibold text-white bg-[#5693C1] border-none rounded-xl cursor-pointer transition-all duration-300 shadow-[0_8px_24px_rgba(86,147,193,0.4)] flex items-center gap-3 min-w-[260px] justify-center hover:bg-[#427aa1] hover:-translate-y-1"
          >
            Go to Dashboard
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>

          <Link
            href="/dashboard/readiness"
            className="px-10 md:px-12 py-5 text-lg font-semibold text-[#5693C1] bg-transparent border-2 border-[#5693C1] rounded-xl cursor-pointer transition-all duration-300 flex items-center gap-3 min-w-[260px] justify-center hover:bg-[#5693C1] hover:text-white hover:-translate-y-1"
          >
            Check Your Readiness
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1000px] mx-auto">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="bg-white p-8 rounded-2xl border border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_24px_rgba(86,147,193,0.15)]"
            >
              <div className="w-14 h-14 rounded-xl bg-[#5693C1]/15 flex items-center justify-center mx-auto mb-6 text-[#5693C1]">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-[15px] text-slate-500 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
