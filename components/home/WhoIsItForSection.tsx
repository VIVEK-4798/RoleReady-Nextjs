/**
 * Who Is It For Section
 * 
 * Displays target audience cards with enhanced visual design and stats.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  User, 
  RefreshCw, 
  Users, 
  Target, 
  BookOpen, 
  TrendingUp,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Award,
  Sparkles,
  BarChart3,
  Clock,
  Heart
} from 'lucide-react';

const audienceCards = [
  { 
    id: 1, 
    icon: <GraduationCap className="w-8 h-8" />,
    title: 'Final Year Students', 
    description: 'Preparing for campus placements and want to maximize your chances of landing your dream role.', 
    features: ['Campus placement optimization', 'Role-specific gap analysis', 'Interview readiness tracking'], 
    color: '#5693C1',
    gradient: 'from-blue-500 to-[#5693C1]',
    stats: '85% of our users'
  },
  { 
    id: 2, 
    icon: <User className="w-8 h-8" />,
    title: 'Pre-Final Year Students', 
    description: 'Getting a head start on placement preparation to be ahead of the curve when the time comes.', 
    features: ['Early skill gap identification', 'Long-term preparation roadmap', 'Summer internship optimization'], 
    color: '#0EA5E9',
    gradient: 'from-cyan-500 to-sky-500',
    stats: '65% early adoption'
  },
  { 
    id: 3, 
    icon: <RefreshCw className="w-8 h-8" />,
    title: 'Career Switchers', 
    description: 'Transitioning to a new domain and want to understand what skills you need to make the switch.', 
    features: ['Cross-domain skill mapping', 'Transition strategy planning', 'Industry validation'], 
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-500',
    stats: '40% success rate'
  },
  { 
    id: 4, 
    icon: <Users className="w-8 h-8" />,
    title: 'Mentors & Educators', 
    description: 'Guide students with data-driven insights and track their progress effectively.', 
    features: ['Student progress monitoring', 'Data-driven interventions', 'Curriculum alignment insights'], 
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-500',
    stats: '200+ professionals'
  }
];

const stats = [
  { 
    number: '85%', 
    label: 'Final Year Students', 
    description: 'achieve placements',
    color: '#5693C1',
    icon: <GraduationCap className="w-6 h-6" />
  },
  { 
    number: '65%', 
    label: 'Pre-Final Year Students', 
    description: 'start early preparation',
    color: '#0EA5E9',
    icon: <TrendingUp className="w-6 h-6" />
  },
  { 
    number: '40%', 
    label: 'Career Switchers', 
    description: 'successfully transition',
    color: '#10B981',
    icon: <RefreshCw className="w-6 h-6" />
  },
  { 
    number: '200+', 
    label: 'Mentors & Educators', 
    description: 'trust our platform',
    color: '#F59E0B',
    icon: <Users className="w-6 h-6" />
  }
];

export default function WhoIsItForSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-32 px-4 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#5693C1]/5 to-transparent" />
      <div className="absolute top-20 -right-40 w-96 h-96 rounded-full bg-gradient-to-bl from-blue-50/40 to-cyan-50/30 blur-3xl" />
      <div className="absolute bottom-20 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-emerald-50/30 to-teal-50/20 blur-3xl" />
      
      {/* Animated floating elements */}
      <div className="absolute top-40 left-10 w-4 h-4 rounded-full bg-[#5693C1]/20 animate-pulse" />
      <div className="absolute top-1/3 right-20 w-6 h-6 rounded-full bg-[#5693C1]/10 animate-pulse delay-1000" />
      <div className="absolute bottom-1/4 left-1/4 w-3 h-3 rounded-full bg-[#5693C1]/15 animate-pulse delay-500" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#5693C1]/10 to-cyan-100/50 text-[#5693C1] font-semibold text-sm mb-6">
            <Target className="w-4 h-4" />
            Designed For You
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Who Is{' '}
            <span className="relative">
              <span className="text-[#5693C1]">RoleReady</span>
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#5693C1] to-cyan-300 rounded-full" />
            </span>{' '}
            For?
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            RoleReady is designed for anyone looking to understand their readiness and improve strategically.
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#5693C1]" />
              <span>Personalized for each journey</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#5693C1]" />
              <span>Proven success stories</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#5693C1]" />
              <span>Trusted by thousands</span>
            </div>
          </div>
        </div>

        {/* Audience Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 md:mb-20">
          {audienceCards.map((card) => (
            <div 
              key={card.id}
              className="group relative bg-white rounded-2xl p-8 border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                transform: hoveredCard === card.id ? 'translateY(-8px)' : 'translateY(0)',
                boxShadow: hoveredCard === card.id 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)' 
                  : '0 4px 24px rgba(0, 0, 0, 0.05)'
              }}
            >
              {/* Card accent */}
              <div 
                className="absolute top-0 left-0 w-full h-1 rounded-t-2xl transition-all duration-300"
                style={{ 
                  background: `linear-gradient(90deg, ${card.color}, ${card.color}80)`,
                  opacity: hoveredCard === card.id ? 1 : 0.7
                }}
              />
              
              {/* Stats badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full bg-gray-50 text-xs font-medium text-gray-500">
                <BarChart3 className="w-3 h-3" />
                {card.stats}
              </div>

              {/* Icon */}
              <div 
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                  hoveredCard === card.id 
                    ? `bg-gradient-to-br ${card.gradient} text-white scale-110` 
                    : 'bg-gray-50 text-gray-700'
                }`}
                style={{ 
                  backgroundColor: hoveredCard === card.id ? 'transparent' : `${card.color}15`
                }}
              >
                <div className={`transition-transform duration-300 ${hoveredCard === card.id ? 'scale-110' : ''}`}>
                  {card.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-6">
                {card.description}
              </p>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {card.features.map((feature, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 hover:bg-white hover:shadow-sm transition-all duration-200"
                  >
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ 
                        backgroundColor: `${card.color}20`,
                        color: card.color
                      }}
                    >
                      <CheckCircle className="w-3 h-3" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link
                href="/signup"
                className={`group/btn w-full py-3 rounded-xl font-semibold text-center transition-all duration-300 flex items-center justify-center gap-2 ${
                  hoveredCard === card.id 
                    ? 'bg-gradient-to-r from-[#5693C1] to-[#4a80b0] text-white shadow-lg' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Get Started
                <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${
                  hoveredCard === card.id ? 'translate-x-1' : ''
                }`} />
              </Link>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="relative mb-16">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-50/50 to-white rounded-3xl" />
          
          <div className="relative max-w-6xl mx-auto py-12 px-8 md:px-12 rounded-3xl border border-gray-100 bg-white/60 backdrop-blur-sm">
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Proven Success Across All Journeys
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Real results from students and professionals using RoleReady
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6"
                    style={{ 
                      backgroundColor: `${stat.color}15`,
                      color: stat.color
                    }}
                  >
                    {stat.icon}
                  </div>
                  
                  <div 
                    className="text-5xl md:text-6xl font-bold mb-2 tracking-tight"
                    style={{ color: stat.color }}
                  >
                    {stat.number}
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {stat.label}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {stat.description}
                    </p>
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>100%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: '100%',
                          background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

 {/* Bottom CTA */}
<div className="max-w-4xl mx-auto">
  <div className="relative bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-lg">
    <div className="relative text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#5693C1]/10 rounded-full text-sm font-medium mb-6 text-[#5693C1]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        Ready to Start Your Journey?
      </div>
      
      <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
        Find Your Path to Success
      </h3>
      
      <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
        Whether you're a student, career switcher, or mentor, we have the perfect solution for your needs.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/signup"
          className="group h-14 bg-gradient-to-r from-[#5693C1] to-cyan-500 text-white rounded-xl font-semibold px-8 flex items-center justify-center gap-3 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Start Free Assessment
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
        
        <Link
          href="/demo"
          className="group h-14 bg-white text-[#5693C1] border-2 border-[#5693C1] rounded-xl font-semibold px-8 flex items-center justify-center gap-3 hover:bg-[#5693C1] hover:text-white transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Schedule a Demo
          <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </Link>
      </div>
      
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>No credit card required</span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-400" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <span>Free 14-day trial</span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-400" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Get results in 5 minutes</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        
        .floating {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}