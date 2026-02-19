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
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Award,
  BarChart3,
  TrendingUp,
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

const statsData = [
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

interface WhoIsItForSectionProps {
  content: {
    title: string;
    subtitle: string;
    order: string[];
  };
  role: 'student' | 'mentor';
}

export default function WhoIsItForSection({ content, role }: WhoIsItForSectionProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Map roles to IDs for reordering
  const orderedCards = content.order.map(roleKey => {
    if (roleKey === 'student') return [audienceCards[0], audienceCards[1], audienceCards[2]];
    if (roleKey === 'mentor') return [audienceCards[3]];
    return [];
  }).flat();

  // If a role is unknown or unexpected, fallback to original list
  const finalCards = orderedCards.length > 0 ? orderedCards : audienceCards;

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
            {content.title}
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
            {content.subtitle}
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
          {finalCards.map((card) => {
            const isUserRole = (role === 'mentor' && card.id === 4) || (role === 'student' && (card.id === 1 || card.id === 2));
            return (
              <div
                key={card.id}
                className={`group relative bg-white rounded-2xl p-8 border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer ${isUserRole ? 'border-[#5693C1] shadow-md ring-1 ring-[#5693C1]/10' : 'border-gray-100'
                  }`}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  transform: hoveredCard === card.id ? 'translateY(-8px)' : 'translateY(0)',
                  boxShadow: hoveredCard === card.id
                    ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
                    : '0 4px 24px rgba(0, 0, 0, 0.05)'
                }}
              >
                {/* Your Role Badge */}
                {isUserRole && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#5693C1] text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm z-10">
                    Your Role
                  </div>
                )}

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
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${hoveredCard === card.id
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
                  className={`group/btn w-full py-3 rounded-xl font-semibold text-center transition-all duration-300 flex items-center justify-center gap-2 ${hoveredCard === card.id
                    ? 'bg-gradient-to-r from-[#5693C1] to-[#4a80b0] text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  Get Started
                  <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${hoveredCard === card.id ? 'translate-x-1' : ''
                    }`} />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="relative">
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
              {statsData.map((stat, index) => (
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