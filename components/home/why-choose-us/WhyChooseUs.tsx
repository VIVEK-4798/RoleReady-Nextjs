/**
 * WhyChooseUs Section Component
 * 
 * "Why RoleReady?" section for the landing page.
 * Migrated from old React.js project - preserves original structure and behavior.
 */

'use client';

import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import DemoModal from './DemoModal';

// Icons as SVG components for better performance
const SearchIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BullseyeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChartBarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const RoadIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const UserCheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

// Data
const differences = [
  {
    id: 1,
    icon: <SearchIcon />,
    title: 'Not a Job Portal',
    text: "We don't just list jobs. We prepare you for them with precise readiness assessment before you even apply.",
  },
  {
    id: 2,
    icon: <BullseyeIcon />,
    title: 'Focuses on Readiness, Not Applications',
    text: 'Shift from quantity of applications to quality of preparation. Know exactly where you stand before applying.',
  },
  {
    id: 3,
    icon: <ChartBarIcon />,
    title: 'Clear Explanations, Not Just Scores',
    text: 'Get detailed breakdowns of why you scored what you did, with specific improvement areas and actionable insights.',
  },
  {
    id: 4,
    icon: <RoadIcon />,
    title: 'Structured Guidance, Not Guesswork',
    text: 'Follow a personalized, step-by-step roadmap instead of random preparation. Every action has a purpose.',
  },
  {
    id: 5,
    icon: <UserCheckIcon />,
    title: 'Mentor-Backed Validation',
    text: 'Optional expert validation ensures your preparation meets industry standards and expectations.',
  },
];

const comparisonPoints = [
  {
    traditional: 'Apply everywhere, hope something sticks',
    roleready: "Apply selectively, knowing you're ready",
  },
  {
    traditional: 'Generic preparation advice',
    roleready: 'Personalized, role-specific guidance',
  },
  {
    traditional: 'No feedback on rejections',
    roleready: 'Detailed gap analysis before applying',
  },
  {
    traditional: 'Unstructured learning',
    roleready: 'Step-by-step improvement roadmap',
  },
];

export interface WhyChooseUsRef {
  scrollToCTAAndOpenDemo: () => void;
}

const WhyChooseUs = forwardRef<WhyChooseUsRef>((props, ref) => {
  const [showDemo, setShowDemo] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Expose method to parent (matches old project behavior)
  useImperativeHandle(ref, () => ({
    scrollToCTAAndOpenDemo() {
      ctaRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Allow scroll to finish before modal opens
      setTimeout(() => {
        setShowDemo(true);
      }, 400);
    },
  }));

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#5693C1]/10 mb-4">
            <p className="text-sm font-medium text-[#5693C1]">
              What Makes Us Different
            </p>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Why RoleReady?
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We&apos;re redefining placement preparation with a focus on readiness over resumes, and clarity over confusion.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Core Differentiators Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Our Core Differentiators
            </h3>

            <div className="space-y-5">
              {differences.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#5693C1]/10 flex items-center justify-center text-[#5693C1]">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Metric Box */}
            <div className="mt-8 p-5 rounded-xl bg-gradient-to-r from-[#5693C1] to-[#4080aa] text-white">
              <div className="text-2xl font-bold mb-1">3x Higher</div>
              <p className="text-sm text-white/90">
                interview conversion rate for students who use RoleReady vs traditional methods
              </p>
            </div>
          </div>

          {/* Comparison Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Traditional vs RoleReady
            </h3>

            {/* Comparison Header */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Traditional Approach
              </p>
              <p className="text-sm font-semibold text-[#5693C1] uppercase tracking-wide text-right">
                RoleReady
              </p>
            </div>

            {/* Comparison Items */}
            <div className="space-y-4">
              {comparisonPoints.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 gap-4 py-4 border-b border-gray-100 last:border-0"
                >
                  {/* Traditional */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-red-500 flex-shrink-0">
                      <XIcon />
                    </span>
                    <p className="text-sm">{item.traditional}</p>
                  </div>

                  {/* RoleReady */}
                  <div className="flex items-center gap-2 justify-end text-gray-900">
                    <p className="text-sm text-right">{item.roleready}</p>
                    <span className="text-[#5693C1] flex-shrink-0">
                      <CheckCircleIcon />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section — TARGET SCROLL POINT */}
        <div ref={ctaRef} className="relative">
          <div className="bg-gradient-to-r from-[#5693C1] to-[#4080aa] rounded-2xl p-8 lg:p-12 text-center">
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">
              Experience the Difference Yourself
            </h3>

            <p className="text-white/90 mb-8 max-w-xl mx-auto">
              See how RoleReady transforms your placement preparation in minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/signup"
                className="px-8 py-3 bg-white text-[#5693C1] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Start Free Analysis
              </a>

              <button
                onClick={() => setShowDemo(true)}
                className="px-8 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
              >
                Try{' '}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded text-sm">
                  🎭 DEMO
                </span>
              </button>
            </div>

            <p className="text-sm text-white/70 mt-6">
              No credit card required • Takes 5 minutes • Get instant results
            </p>
          </div>
        </div>

        {/* Demo Modal */}
        {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
      </div>
    </section>
  );
});

WhyChooseUs.displayName = 'WhyChooseUs';

export default WhyChooseUs;
