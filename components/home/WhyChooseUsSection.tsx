/**
 * Why Choose Us Section
 * 
 * Shows core differentiators and comparison table with enhanced visual design.
 * Includes Demo Modal for landing page readiness demo.
 */

'use client';

import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import Link from 'next/link';
import { DemoModal } from './why-choose-us';
import { 
  Target, 
  Shield, 
  Sparkles, 
  BarChart3, 
  Map, 
  Users, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Zap,
  TrendingUp,
  Award,
  Clock,
  Heart,
  Brain,
  Star,
  Eye,
  PlayCircle
} from 'lucide-react';

const differences = [
  { 
    id: 1, 
    icon: <Target className="w-6 h-6" />,
    title: 'Not a Job Portal', 
    text: "We don't just list jobs. We prepare you to actually get them by focusing on readiness first.",
    color: '#5693C1',
    gradient: 'from-blue-500 to-[#5693C1]'
  },
  { 
    id: 2, 
    icon: <Shield className="w-6 h-6" />,
    title: 'Focuses on Readiness, Not Applications', 
    text: 'We help you understand when you\'re ready to apply, not just where to apply.',
    color: '#0EA5E9',
    gradient: 'from-cyan-500 to-sky-500'
  },
  { 
    id: 3, 
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Clear Explanations, Not Just Scores', 
    text: 'Every score comes with detailed reasoning so you know exactly what to improve.',
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-500'
  },
  { 
    id: 4, 
    icon: <Map className="w-6 h-6" />,
    title: 'Structured Guidance, Not Guesswork', 
    text: 'Follow a personalized roadmap instead of random preparation strategies.',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-500'
  },
  { 
    id: 5, 
    icon: <Users className="w-6 h-6" />,
    title: 'Mentor-Backed Validation', 
    text: 'Get your skills verified by industry professionals for credibility.',
    color: '#8B5CF6',
    gradient: 'from-purple-500 to-violet-500'
  },
];

const comparisonPoints = [
  { 
    traditional: 'Apply everywhere, hope something sticks', 
    roleready: "Apply selectively, knowing you're ready",
    traditionalIcon: <XCircle className="w-4 h-4" />,
    rolereadyIcon: <CheckCircle className="w-4 h-4" />
  },
  { 
    traditional: 'Generic preparation advice', 
    roleready: 'Personalized, role-specific guidance',
    traditionalIcon: <XCircle className="w-4 h-4" />,
    rolereadyIcon: <CheckCircle className="w-4 h-4" />
  },
  { 
    traditional: 'No feedback on rejections', 
    roleready: 'Detailed gap analysis before applying',
    traditionalIcon: <XCircle className="w-4 h-4" />,
    rolereadyIcon: <CheckCircle className="w-4 h-4" />
  },
  { 
    traditional: 'Unstructured learning', 
    roleready: 'Step-by-step improvement roadmap',
    traditionalIcon: <XCircle className="w-4 h-4" />,
    rolereadyIcon: <CheckCircle className="w-4 h-4" />
  },
];

export interface WhyChooseUsSectionRef {
  scrollToCTA: () => void;
  scrollToCTAAndOpenDemo: () => void;
}

const WhyChooseUsSection = forwardRef<WhyChooseUsSectionRef>((_, ref) => {
  const ctaRef = useRef<HTMLDivElement>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [activeComparison, setActiveComparison] = useState<number | null>(null);

  useImperativeHandle(ref, () => ({
    scrollToCTA() {
      ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    scrollToCTAAndOpenDemo() {
      ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        setShowDemo(true);
      }, 400);
    },
  }));

  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-32 px-4 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#5693C1]/5 to-transparent" />
      <div className="absolute top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-bl from-blue-50/40 to-cyan-50/30 blur-3xl" />
      <div className="absolute bottom-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-tr from-emerald-50/30 to-teal-50/20 blur-3xl" />
      
      {/* Animated floating elements */}
      <div className="absolute top-32 left-10 w-4 h-4 rounded-full bg-[#5693C1]/20 animate-pulse" />
      <div className="absolute top-1/2 right-20 w-6 h-6 rounded-full bg-[#5693C1]/10 animate-pulse delay-1000" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#5693C1]/10 to-cyan-100/50 text-[#5693C1] font-semibold text-sm mb-6">
            <Award className="w-4 h-4" />
            What Makes Us Different
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Why Choose{' '}
            <span className="relative">
              <span className="text-[#5693C1]">RoleReady</span>
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#5693C1] to-cyan-300 rounded-full" />
            </span>
            ?
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            We're redefining placement preparation with a focus on readiness, not just applications.
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#5693C1]" />
              <span>5x better outcomes</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#5693C1]" />
              <span>Trusted by 10k+ students</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#5693C1]" />
              <span>AI-powered insights</span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Core Differentiators */}
          <div className="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#5693C1]/10 to-transparent rounded-tr-3xl" />
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5693C1] to-cyan-500 flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Our Core Differentiators
                </h3>
                <p className="text-gray-500 text-sm">What sets us apart</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {differences.map((item) => (
                <div 
                  key={item.id} 
                  className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 group cursor-pointer"
                >
                  <div 
                    className="relative w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${item.color}, ${item.color}80)`
                    }}
                  >
                    <div className="text-white">
                      {item.icon}
                    </div>
                    <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#5693C1] transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Metric Box */}
            <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#5693C1]/5 to-transparent" />
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5693C1] to-cyan-500 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-white flex items-center justify-center">
                    <span className="text-xs font-bold text-white">↑</span>
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    3x Higher
                  </div>
                  <p className="text-gray-600">
                    Interview conversion rate compared to students who apply without readiness assessment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-tr-3xl" />
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Traditional vs RoleReady
                </h3>
                <p className="text-gray-500 text-sm">See the difference</p>
              </div>
            </div>

            {/* Comparison Headers */}
            <div className="flex justify-between mb-6 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl">
              <div className="text-center w-[48%]">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-2">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-red-600">Traditional Approach</p>
              </div>
              
              <div className="flex items-center justify-center w-[4%]">
                <div className="w-0.5 h-12 bg-gradient-to-b from-gray-300 to-transparent" />
              </div>
              
              <div className="text-center w-[48%]">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5693C1] to-cyan-500 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-[#5693C1]">RoleReady</p>
              </div>
            </div>

            {/* Comparison Items */}
            <div className="space-y-3">
              {comparisonPoints.map((item, index) => (
                <div 
                  key={index} 
                  className={`flex justify-between items-center p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                    activeComparison === index 
                      ? 'bg-gradient-to-r from-[#5693C1]/5 to-cyan-500/5 border border-[#5693C1]/20' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onMouseEnter={() => setActiveComparison(index)}
                  onMouseLeave={() => setActiveComparison(null)}
                  onClick={() => setActiveComparison(index)}
                >
                  <div className="flex items-center gap-3 w-[48%]">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      activeComparison === index ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.traditionalIcon}
                    </div>
                    <p className={`text-sm font-medium transition-colors ${
                      activeComparison === index ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                      {item.traditional}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center w-[4%]">
                    <ArrowRight className={`w-4 h-4 transition-all duration-300 ${
                      activeComparison === index ? 'text-[#5693C1] scale-110' : 'text-gray-400'
                    }`} />
                  </div>
                  
                  <div className="flex items-center gap-3 w-[48%] justify-end">
                    <p className={`text-sm font-medium text-right transition-colors ${
                      activeComparison === index ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {item.roleready}
                    </p>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      activeComparison === index ? 'bg-[#5693C1]/20 text-[#5693C1]' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.rolereadyIcon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Success Metric */}
            <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-green-800 mb-1">Average Improvement</div>
                  <div className="text-2xl font-bold text-green-900">87% increase</div>
                  <div className="text-xs text-green-600">in placement readiness score</div>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <ArrowRight className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

{/* CTA Section */}
<div ref={ctaRef} className="max-w-6xl mx-auto">
  <div className="relative bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-lg">
    <div className="relative grid lg:grid-cols-2 gap-8 items-center">
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#5693C1]/10 rounded-full text-sm font-medium mb-6 text-[#5693C1]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Experience the Difference
        </div>
        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          See How RoleReady Transforms Your Journey
        </h3>
        <p className="text-gray-600 text-lg mb-8 max-w-xl">
          From guesswork to data-driven precision. Join thousands of students who've achieved their dream placements.
        </p>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-[#5693C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>5-minute setup</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-[#5693C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Instant insights</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-[#5693C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>No credit card needed</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <Link
          href="/signup"
          className="group w-full h-16 bg-gradient-to-r from-[#5693C1] to-cyan-500 text-white rounded-xl font-semibold flex items-center justify-center gap-3 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Start Free Analysis
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
        
        <button
          onClick={() => setShowDemo(true)}
          className="group w-full h-16 bg-white text-[#5693C1] border-2 border-[#5693C1] rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-[#5693C1] hover:text-white transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Try Interactive Demo
          <div className="px-3 py-1 bg-[#5693C1]/10 rounded-lg text-sm font-medium group-hover:bg-white/30">
            🎯 LIVE
          </div>
        </button>
      </div>
    </div>
    
    {/* Trust badge */}
    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 rounded-full inline-block">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm font-medium text-gray-700">
          Trusted by 10,000+ students
        </span>
      </div>
    </div>
  </div>
</div>

        {/* Demo Modal */}
        {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
      </div>

      <style jsx>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .floating {
          animation: float-gentle 4s ease-in-out infinite;
        }
        
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        
        .glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
});

WhyChooseUsSection.displayName = 'WhyChooseUsSection';

export default WhyChooseUsSection;