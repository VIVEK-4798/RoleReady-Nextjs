/**
 * Authenticated User Call To Action Section
 * 
 * Clean, professional CTA section for logged-in users.
 */

'use client';

import Link from 'next/link';
import { 
  ArrowRight,
  CheckCircle,
  Target,
  BarChart3,
  TrendingUp
} from 'lucide-react';

const features = [
  { 
    icon: <Target className="w-6 h-6" />,
    title: 'Check Readiness', 
    desc: 'Instantly assess your current level for target roles' 
  },
  { 
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Identify Gaps', 
    desc: 'Discover exact skills you need to improve' 
  },
  { 
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Clear Path', 
    desc: 'Get personalized steps to reach your goals' 
  }
];

export default function AuthenticatedCTASection() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Start Preparing{' '}
            <span className="text-[#5693C1] relative">
              Smarter
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#5693C1]/30 rounded-full" />
            </span>
            , Not Harder
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Check your readiness, identify skill gaps, and get a clear improvement path before applying.
          </p>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/dashboard"
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#5693C1] text-white font-semibold rounded-xl hover:bg-[#4a80b0] transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/dashboard/readiness"
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#5693C1] font-semibold rounded-xl border-2 border-[#5693C1] hover:bg-[#5693C1]/5 transition-all duration-200 hover:shadow-md"
          >
            Check Your Readiness
            <CheckCircle className="w-5 h-5" />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="bg-white p-6 rounded-xl border border-gray-200 hover:border-[#5693C1]/30 transition-all duration-300 hover:shadow-lg group"
            >
              <div className="w-12 h-12 rounded-lg bg-[#5693C1]/10 flex items-center justify-center mb-4 text-[#5693C1] group-hover:bg-[#5693C1]/20 transition-colors">
                {feature.icon}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Progress Indicator */}
        {/* <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 mb-4">
            <div className="w-2 h-2 rounded-full bg-[#5693C1]" />
            <span>Your personalized journey awaits in the dashboard</span>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#5693C1] to-cyan-500 rounded-full transition-all duration-1000"
                style={{ width: '60%' }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Start</span>
              <span>Progress</span>
              <span>Complete</span>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
}