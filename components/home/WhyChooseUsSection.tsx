/**
 * Why Choose Us Section
 * 
 * Shows core differentiators and comparison table.
 * Migrated from WhyChooseUs component in the old React project.
 */

'use client';

import { useRef, forwardRef, useImperativeHandle } from 'react';
import Link from 'next/link';

const differences = [
  { 
    id: 1, 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Not a Job Portal', 
    text: "We don't just list jobs. We prepare you to actually get them by focusing on readiness first." 
  },
  { 
    id: 2, 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Focuses on Readiness, Not Applications', 
    text: 'We help you understand when you\'re ready to apply, not just where to apply.' 
  },
  { 
    id: 3, 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Clear Explanations, Not Just Scores', 
    text: 'Every score comes with detailed reasoning so you know exactly what to improve.' 
  },
  { 
    id: 4, 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    title: 'Structured Guidance, Not Guesswork', 
    text: 'Follow a personalized roadmap instead of random preparation strategies.' 
  },
  { 
    id: 5, 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: 'Mentor-Backed Validation', 
    text: 'Get your skills verified by industry professionals for credibility.' 
  },
];

const comparisonPoints = [
  { traditional: 'Apply everywhere, hope something sticks', roleready: "Apply selectively, knowing you're ready" },
  { traditional: 'Generic preparation advice', roleready: 'Personalized, role-specific guidance' },
  { traditional: 'No feedback on rejections', roleready: 'Detailed gap analysis before applying' },
  { traditional: 'Unstructured learning', roleready: 'Step-by-step improvement roadmap' },
];

export interface WhyChooseUsSectionRef {
  scrollToCTA: () => void;
}

const WhyChooseUsSection = forwardRef<WhyChooseUsSectionRef>((_, ref) => {
  const ctaRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    scrollToCTA() {
      ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  }));

  return (
    <section className="py-24 px-5 bg-blue-50">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-[#5693C1]/10 rounded-full mb-4">
            <p className="text-sm font-semibold text-[#5693C1]">What Makes Us Different</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Why RoleReady?
          </h2>
          <p className="text-lg text-slate-600 max-w-[700px] mx-auto">
            We're redefining placement preparation with a focus on readiness, not just applications.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Core Differentiators */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Our Core Differentiators
            </h3>
            
            <div className="space-y-6">
              {differences.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5693C1]/20 to-[#5693C1]/10 flex items-center justify-center text-[#5693C1] flex-shrink-0 group-hover:bg-[#5693C1] group-hover:text-white transition-colors duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Metric Box */}
            <div className="mt-8 p-6 bg-gradient-to-r from-[#5693C1]/5 to-[#5693C1]/10 rounded-xl border border-[#5693C1]/20">
              <div className="text-3xl font-extrabold text-[#5693C1] mb-2">
                3x Higher
              </div>
              <p className="text-sm text-slate-600">
                Interview conversion rate compared to students who apply without readiness assessment.
              </p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Traditional vs RoleReady
            </h3>

            <div className="flex justify-between mb-4 pb-4 border-b border-gray-200">
              <p className="text-sm font-semibold text-red-500 w-[45%]">Traditional Approach</p>
              <p className="text-sm font-semibold text-[#5693C1] w-[45%] text-right">RoleReady</p>
            </div>

            <div className="space-y-4">
              {comparisonPoints.map((item, index) => (
                <div key={index} className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-start gap-2 w-[45%]">
                    <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-slate-600">{item.traditional}</p>
                  </div>
                  <div className="flex items-start gap-2 w-[45%] justify-end">
                    <p className="text-sm text-slate-700 font-medium text-right">{item.roleready}</p>
                    <svg className="w-4 h-4 text-[#5693C1] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div ref={ctaRef} className="max-w-[900px] mx-auto">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-10 md:p-12 text-center text-white shadow-xl">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Experience the Difference Yourself
            </h3>
            <p className="text-slate-300 max-w-[600px] mx-auto mb-8">
              See how RoleReady transforms your placement preparation from guesswork to a data-driven journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-[#5693C1] hover:bg-[#4a80b0] text-white font-semibold rounded-xl transition-all duration-300 hover:-translate-y-1"
              >
                Start Free Analysis
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                Try Demo
              </Link>
            </div>
            <p className="text-slate-400 text-sm mt-6">
              No credit card required • Takes 5 minutes • Get instant results
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

WhyChooseUsSection.displayName = 'WhyChooseUsSection';

export default WhyChooseUsSection;
