/**
 * Counter Section Component
 * 
 * Displays problem cards and animated statistics with enhanced visual design.
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  Target, 
  XCircle, 
  AlertCircle, 
  BarChart, 
  Users, 
  MessageSquare, 
  Zap,
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
  inView: boolean;
}

function AnimatedCounter({ target, duration = 2000, suffix = '', inView }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    
    let startTime: number;
    const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      
      if (progress < 1) {
        setCount(Math.floor(eased * target));
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, inView]);

  return <span className="counter-value">{count}{suffix}</span>;
}

const problems = [
  { 
    icon: <Target className="w-8 h-8" />, 
    title: 'Blind Applications', 
    description: "Students apply without knowing if they're truly ready, wasting time and opportunities.", 
    color: '#4F46E5',
    gradient: 'from-indigo-500 to-purple-600',
    bgColor: '#EEF2FF'
  },
  { 
    icon: <XCircle className="w-8 h-8" />, 
    title: 'Silent Rejections', 
    description: 'Rejections come without meaningful feedback, leaving students confused about what to improve.', 
    color: '#0EA5E9',
    gradient: 'from-sky-500 to-cyan-500',
    bgColor: '#F0F9FF'
  },
  { 
    icon: <AlertCircle className="w-8 h-8" />, 
    title: 'Hidden Skill Gaps', 
    description: 'Critical skill gaps remain invisible until it\'s too late to address them.', 
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-500',
    bgColor: '#F0FDF4'
  },
  { 
    icon: <BarChart className="w-8 h-8" />, 
    title: 'Unstructured Efforts', 
    description: 'Preparation becomes random and inefficient without a clear roadmap to follow.', 
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-500',
    bgColor: '#FFFBEB'
  },
];

const stats = [
  { 
    value: 85, 
    label: 'Students apply blindly', 
    suffix: '%', 
    color: '#4F46E5',
    icon: <Users className="w-6 h-6" />,
    description: 'apply without proper assessment'
  },
  { 
    value: 9, 
    label: 'Get no feedback on rejections', 
    suffix: '/10', 
    color: '#0EA5E9',
    icon: <MessageSquare className="w-6 h-6" />,
    description: 'receive zero actionable feedback'
  },
  { 
    value: 70, 
    label: "Don't know their skill gaps", 
    suffix: '%', 
    color: '#10B981',
    icon: <Zap className="w-6 h-6" />,
    description: 'are unaware of critical weaknesses'
  },
];

export default function CounterSection() {
  const [inView, setInView] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.2, rootMargin: '-50px' }
    );

    const element = sectionRef.current;
    if (element) observer.observe(element);
    return () => { if (element) observer.unobserve(element); };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-20 md:py-32 px-4 sm:px-6 lg:px-8"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#5693C1]/5 to-transparent" />
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-100/30 to-[#5693C1]/10 blur-3xl" />
      <div className="absolute bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-emerald-100/30 to-cyan-100/30 blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5693C1]/10 text-[#5693C1] font-semibold text-sm mb-6">
            <AlertCircle className="w-4 h-4" />
            The Real Challenge
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            The Problem <span className="text-[#5693C1] relative">
              Students
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#5693C1] to-indigo-300 rounded-full" />
            </span> Face
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Traditional placement preparation leaves students guessing about their readiness, 
            leading to frustration and missed opportunities.
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Data-driven insights</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#5693C1]" />
              <span>Industry research</span>
            </div>
          </div>
        </div>

        {/* Problem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 md:mb-28">
          {problems.map((problem, index) => (
            <div 
              key={index} 
              className="group relative bg-white rounded-2xl p-8 border border-gray-100 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
              onMouseEnter={() => setActiveCard(index)}
              onMouseLeave={() => setActiveCard(null)}
              style={{
                transform: activeCard === index ? 'translateY(-8px)' : 'translateY(0)',
                boxShadow: activeCard === index 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)' 
                  : '0 4px 24px rgba(0, 0, 0, 0.05)'
              }}
            >
              {/* Card accent */}
              <div 
                className="absolute top-0 left-0 w-full h-1 rounded-t-2xl transition-all duration-300"
                style={{ 
                  background: `linear-gradient(90deg, ${problem.color}, ${problem.color}80)`,
                  opacity: activeCard === index ? 1 : 0.7
                }}
              />
              
              {/* Icon container */}
              <div 
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${
                  activeCard === index 
                    ? `bg-gradient-to-br ${problem.gradient} text-white scale-110` 
                    : 'bg-gray-50 text-gray-700'
                }`}
                style={{ 
                  backgroundColor: activeCard === index ? 'transparent' : problem.bgColor 
                }}
              >
                <div className={`transition-transform duration-300 ${activeCard === index ? 'scale-110' : ''}`}>
                  {problem.icon}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {problem.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed mb-6">
                {problem.description}
              </p>
              
              <div className="flex items-center text-[#5693C1] font-medium text-sm">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-50/50 to-white rounded-3xl" />
          
          <div className="relative max-w-6xl mx-auto py-12 px-8 md:px-12 rounded-3xl border border-gray-100 bg-white/60 backdrop-blur-sm">
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                The Numbers Don't Lie
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Based on comprehensive research with thousands of students
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
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
                    className="text-5xl md:text-6xl font-bold mb-3 tracking-tight"
                    style={{ color: stat.color }}
                  >
                    {inView ? (
                      <AnimatedCounter 
                        target={stat.value} 
                        duration={1800} 
                        suffix={stat.suffix} 
                        inView={inView}
                      />
                    ) : (
                      `0${stat.suffix}`
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {stat.label}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {stat.description}
                    </p>
                  </div>
                  
                  {/* Progress bar for visual effect */}
                  <div className="mt-6 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: inView ? '100%' : '0%',
                        background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Call to action */}
            <div className="mt-12 pt-8 border-t border-gray-100 text-center">
              <p className="text-gray-600 mb-4">
                Ready to solve these problems?
              </p>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5693C1] to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                <Target className="w-5 h-5" />
                Start Your Journey
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .counter-value {
          font-variant-numeric: tabular-nums;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .floating {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}