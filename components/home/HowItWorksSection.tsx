/**
 * How It Works Section (JoinOurBusiness)
 * 
 * Shows the 5-step process of how RoleReady works.
 * Migrated from JoinOurBusiness component in the old React project.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks';

interface HowItWorksSectionProps {
  content: {
    title: string;
    subtitle: string;
    steps: {
      title: string;
      description: string;
      features: string[];
    }[];
    finalCTATitle: string;
    finalCTASubtitle: string;
    finalCTAButton: string;
  };
}

export default function HowItWorksSection({ content }: HowItWorksSectionProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const { user } = useAuth();

  const stepIcons = [
    <svg key="1" className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>,
    <svg key="2" className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>,
    <svg key="3" className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>,
    <svg key="4" className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>,
    <svg key="5" className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ];

  return (
    <section className="bg-gradient-to-br from-white to-slate-50 py-24 px-5">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            {content.title}
          </h2>
          <p className="text-lg text-slate-500 max-w-[700px] mx-auto">
            {content.subtitle}
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-[#5693C1] to-[#427aa1] mx-auto mt-8 rounded-sm" />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {content.steps.map((step, index) => (
            <div
              key={index}
              className={`relative bg-gradient-to-br from-white/[0.98] to-slate-50/95 rounded-2xl p-10 transition-all duration-400 ease-out ${hoveredCard === index
                  ? 'border border-[#5693C1] shadow-[0_24px_48px_rgba(86,147,193,0.16)] -translate-y-3'
                  : 'border border-[#5693C1]/15 shadow-[0_4px_16px_rgba(0,0,0,0.04)]'
                }`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Step Number Badge */}
              <div className="absolute top-6 right-7 text-[13px] font-bold text-[#5693C1] bg-[#5693C1]/[0.08] px-3.5 py-1.5 rounded-full">
                0{index + 1}
              </div>

              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-[#5693C1] to-[#3d7fa8] rounded-[14px] flex items-center justify-center mb-7">
                {stepIcons[index]}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-900 mb-4 pr-12">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-[15px] text-slate-600 mb-7 leading-relaxed">
                {step.description}
              </p>

              {/* Features */}
              <div className="flex flex-col gap-3">
                {step.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center px-3.5 py-2.5 bg-[#5693C1]/[0.04] rounded-lg transition-transform duration-200 hover:translate-x-1"
                  >
                    <svg className="w-4 h-4 text-[#5693C1] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-slate-700 ml-2.5 font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom Accent Line */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5693C1] to-[#3d7fa8] rounded-b-2xl transition-opacity duration-300 ${hoveredCard === index ? 'opacity-100' : 'opacity-0'
                  }`}
              />
            </div>
          ))}

          {/* CTA Card */}
          <div className="bg-gradient-to-br from-[#5693C1] to-[#3d7fa8] rounded-2xl p-12 text-white flex flex-col justify-center">
            <h3 className="text-2xl md:text-[28px] font-extrabold mb-4 text-center">
              {content.finalCTATitle}
            </h3>
            <p className="text-white/80 text-center mb-8">
              {content.finalCTASubtitle}
            </p>
            <Link
              href={user?.role === 'mentor' ? '/mentor' : '/signup'}
              className="w-full h-14 bg-white text-[#5693C1] border-none rounded-[10px] text-base font-bold cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center justify-center"
            >
              {content.finalCTAButton}
            </Link>
            <p className="text-white/60 text-sm text-center mt-4">
              {user?.role === 'mentor' ? 'Centralized validation workflow' : 'No credit card required'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
