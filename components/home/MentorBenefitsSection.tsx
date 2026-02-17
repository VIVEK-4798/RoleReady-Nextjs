'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    Rocket,
    Target,
    BarChart3,
    Briefcase,
    Timer,
    Star,
    CheckCircle2,
    ArrowUpRight,
    Sparkles,
    Zap,
    Shield
} from 'lucide-react';

const mentorBenefits = [
    {
        title: 'Professional Credibility',
        description: 'Get recognized as a verified mentor with visible impact metrics and validation authority across the platform.',
        icon: <Rocket className="w-6 h-6" />,
        gradient: 'from-blue-500 to-cyan-500',
        lightBg: 'bg-blue-50',
        stats: '92% recognition rate',
        color: 'blue'
    },
    {
        title: 'Access to High-Readiness Talent',
        description: 'Identify and connect with students who are genuinely prepared, structured, and ready to grow.',
        icon: <Target className="w-6 h-6" />,
        gradient: 'from-emerald-500 to-teal-500',
        lightBg: 'bg-emerald-50',
        stats: '2.5x faster matching',
        color: 'emerald'
    },
    {
        title: 'Measurable Impact',
        description: 'Track how your guidance improves readiness scores, skill validation outcomes, and interview conversion rates.',
        icon: <BarChart3 className="w-6 h-6" />,
        gradient: 'from-purple-500 to-pink-500',
        lightBg: 'bg-purple-50',
        stats: '87% success rate',
        color: 'purple'
    },
    {
        title: 'Post Opportunities for Free',
        description: 'Share jobs or internships directly with verified learners and attract candidates aligned with your expectations.',
        icon: <Briefcase className="w-6 h-6" />,
        gradient: 'from-amber-500 to-orange-500',
        lightBg: 'bg-amber-50',
        stats: '500+ opportunities',
        color: 'amber'
    },
    {
        title: 'Structured Validation Workflow',
        description: 'No more scattered resume reviews or random DMs. Review learner progress efficiently through a centralized validation system.',
        icon: <Timer className="w-6 h-6" />,
        gradient: 'from-indigo-500 to-blue-500',
        lightBg: 'bg-indigo-50',
        stats: '3hrs saved/week',
        color: 'indigo'
    },
    {
        title: 'Build Your Personal Brand',
        description: 'Establish yourself as a domain expert while mentoring students in a structured, high-impact environment.',
        icon: <Star className="w-6 h-6" />,
        gradient: 'from-rose-500 to-red-500',
        lightBg: 'bg-rose-50',
        stats: '10k+ audience reach',
        color: 'rose'
    }
];

// Floating orbs component for background
const FloatingOrbs = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#5693C1]/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#3a6a8c]/5 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#5693C1]/3 to-[#3a6a8c]/3 rounded-full blur-3xl animate-pulse delay-500" />
        </div>
    );
};

// Animated counter component
const AnimatedCounter = ({ value }: { value: string }) => {
    const [count, setCount] = useState(0);
    const counterRef = useRef<HTMLSpanElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (counterRef.current) {
            observer.observe(counterRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
        const suffix = value.replace(/[0-9]/g, '');
        let start = 0;
        const duration = 2000;
        const increment = numericValue / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start < numericValue) {
                setCount(Math.floor(start));
            } else {
                setCount(numericValue);
                clearInterval(timer);
            }
        }, 16);

        return () => clearInterval(timer);
    }, [isVisible, value]);

    return <span ref={counterRef}>{count}{value.replace(/[0-9]/g, '')}</span>;
};

export default function MentorBenefitsSection() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const sectionRef = useRef<HTMLElement>(null);

    return (
        <section 
            ref={sectionRef}
            className="relative py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden"
        >
            <FloatingOrbs />

            {/* Animated grid lines */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                <div className="absolute left-1/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
                <div className="absolute right-1/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-gray-200 to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header Section */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#5693C1]/10 to-[#3a6a8c]/10 text-[#5693C1] text-xs font-semibold uppercase tracking-wider mb-6 border border-[#5693C1]/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Sparkles className="w-3.5 h-3.5" />
                        For Verified Mentors
                        <Shield className="w-3.5 h-3.5" />
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                        What Mentors{' '}
                        <span className="bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] bg-clip-text text-transparent">
                            Gain
                        </span>
                    </h2>
                    
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
                        RoleReady doesn't just help students grow — it helps mentors build influence, 
                        <span className="text-[#5693C1] font-medium"> credibility, and measurable impact.</span>
                    </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {mentorBenefits.map((benefit, index) => (
                        <div
                            key={index}
                            className="group relative"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {/* Glow effect on hover */}
                            <div className={`absolute -inset-0.5 bg-gradient-to-r ${benefit.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
                            
                            {/* Main card */}
                            <div className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both backdrop-blur-sm"
                                 style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Corner accent */}
                                <div className={`absolute top-0 right-0 w-12 h-12 bg-gradient-to-br ${benefit.gradient} rounded-bl-2xl rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:-translate-y-0`}>
                                    <ArrowUpRight className="absolute bottom-2 left-2 w-4 h-4 text-white" />
                                </div>

                                {/* Icon with animated background */}
                                <div className="relative mb-6">
                                    <div className={`absolute inset-0 bg-gradient-to-r ${benefit.gradient} rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                                    <div className={`relative w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-md
                                        bg-gradient-to-br ${benefit.gradient} text-white`}>
                                        {benefit.icon}
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#5693C1] transition-colors">
                                    {benefit.title}
                                </h3>
                                
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    {benefit.description}
                                </p>

                                {/* Stats with animated counter */}
                                <div className="flex items-center gap-2 text-sm">
                                    <Zap className={`w-4 h-4 ${hoveredIndex === index ? 'text-[#5693C1]' : 'text-gray-400'} transition-colors`} />
                                    <span className="font-semibold text-gray-900">
                                        <AnimatedCounter value={benefit.stats} />
                                    </span>
                                </div>

                                {/* Hover indicator line */}
                                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${benefit.gradient} rounded-b-2xl transition-all duration-500 ${hoveredIndex === index ? 'w-full' : 'w-0'}`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-1000 fill-mode-both">
                    <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                        <span className="text-gray-700">Ready to make an impact?</span>
                        <button className="bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] text-white px-6 py-2 rounded-full text-sm font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 group">
                            Become a Mentor
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}