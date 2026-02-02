/**
 * Counter Section Component
 * 
 * Displays problem cards and animated statistics.
 * Migrated from Counter2 component in the old React project.
 */

'use client';

import { useEffect, useState, useRef } from 'react';

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
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;
      
      if (progress < 1) {
        setCount(Math.floor(progress * target));
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, inView]);

  return <span>{count}{suffix}</span>;
}

const problems = [
  { 
    icon: '?', 
    title: 'Blind Applications', 
    description: "Students apply without knowing if they're truly ready, wasting time and opportunities.", 
    color: '#4F46E5' 
  },
  { 
    icon: '✖', 
    title: 'Silent Rejections', 
    description: 'Rejections come without meaningful feedback, leaving students confused about what to improve.', 
    color: '#0EA5E9' 
  },
  { 
    icon: '⚡', 
    title: 'Hidden Skill Gaps', 
    description: 'Critical skill gaps remain invisible until it\'s too late to address them.', 
    color: '#10B981' 
  },
  { 
    icon: '📊', 
    title: 'Unstructured Efforts', 
    description: 'Preparation becomes random and inefficient without a clear roadmap to follow.', 
    color: '#F59E0B' 
  },
];

const stats = [
  { value: 85, label: 'Students apply blindly', suffix: '%', color: '#4F46E5' },
  { value: 9, label: 'Get no feedback on rejections', suffix: '/10', color: '#0EA5E9' },
  { value: 70, label: "Don't know their skill gaps", suffix: '%', color: '#10B981' },
];

export default function CounterSection() {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1 }
    );

    const element = sectionRef.current;
    if (element) observer.observe(element);
    return () => { if (element) observer.unobserve(element); };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-24 px-8"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
            The Problem <span className="text-[#5693C1]">Students</span> Face Today
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-[900px] mx-auto mb-10">
            Traditional placement preparation leaves students guessing about their readiness, 
            leading to frustration and missed opportunities.
          </p>
          <div className="h-1 w-[120px] mx-auto bg-gradient-to-r from-[#5693C1] to-indigo-300 rounded-full" />
        </div>

        {/* Problem Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-24">
          {problems.map((problem, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-10 md:p-12 border border-gray-200 cursor-pointer transition-all duration-300 ease-out text-center hover:shadow-[0_32px_48px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-3"
            >
              <div 
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-8 text-[28px]"
                style={{ 
                  background: `linear-gradient(135deg, ${problem.color}15, ${problem.color}05)`,
                  color: problem.color 
                }}
              >
                {problem.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-5">
                {problem.title}
              </h3>
              <div 
                className="h-[3px] w-16 mx-auto mb-5 rounded-full"
                style={{ background: problem.color }}
              />
              <p className="text-base md:text-[17px] text-gray-500 leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="max-w-[1100px] mx-auto pt-20 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div 
                  className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4"
                  style={{ color: stat.color }}
                >
                  {inView ? (
                    <AnimatedCounter 
                      target={stat.value} 
                      duration={2500} 
                      suffix={stat.suffix} 
                      inView={inView}
                    />
                  ) : (
                    `0${stat.suffix}`
                  )}
                </div>
                <div className="text-lg md:text-xl text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
