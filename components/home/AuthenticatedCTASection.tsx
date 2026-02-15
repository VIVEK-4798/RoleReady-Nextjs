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
import { useAuth } from '@/hooks';

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

interface AuthenticatedCTASectionProps {
  content: {
    title: string;
    subtitle: string;
    primaryCTA: string;
    primaryHref: string;
  };
}

export default function AuthenticatedCTASection({ content }: AuthenticatedCTASectionProps) {
  const { user } = useAuth();

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {content.title.split(',').map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <>
                    ,{' '}
                    <span className="text-[#5693C1] relative">
                      Smarter
                      <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#5693C1]/30 rounded-full" />
                    </span>
                  </>
                )}
              </span>
            ))}
            {!content.title.includes(',') && content.title}
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href={content.primaryHref}
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#5693C1] text-white font-semibold rounded-xl hover:bg-[#4a80b0] transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            {content.primaryCTA}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {user?.role !== 'mentor' && (
            <Link
              href="/dashboard/readiness"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#5693C1] font-semibold rounded-xl border-2 border-[#5693C1] hover:bg-[#5693C1]/5 transition-all duration-200 hover:shadow-md"
            >
              Check Your Readiness
              <CheckCircle className="w-5 h-5" />
            </Link>
          )}
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
      </div>
    </section>
  );
}