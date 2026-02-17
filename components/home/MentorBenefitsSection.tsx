'use client';

import React from 'react';
import {
    Rocket,
    Target,
    BarChart3,
    Briefcase,
    Timer,
    Star,
    CheckCircle2
} from 'lucide-react';

const mentorBenefits = [
    {
        title: 'Professional Credibility',
        description: 'Get recognized as a verified mentor with visible impact metrics and validation authority across the platform.',
        icon: <Rocket className="w-6 h-6" />,
        color: 'blue'
    },
    {
        title: 'Access to High-Readiness Talent',
        description: 'Identify and connect with students who are genuinely prepared, structured, and ready to grow.',
        icon: <Target className="w-6 h-6" />,
        color: 'cyan'
    },
    {
        title: 'Measurable Impact',
        description: 'Track how your guidance improves readiness scores, skill validation outcomes, and interview conversion rates.',
        icon: <BarChart3 className="w-6 h-6" />,
        color: 'emerald'
    },
    {
        title: 'Post Opportunities for Free',
        description: 'Share jobs or internships directly with verified learners and attract candidates aligned with your expectations.',
        icon: <Briefcase className="w-6 h-6" />,
        color: 'amber'
    },
    {
        title: 'Structured Validation Workflow',
        description: 'No more scattered resume reviews or random DMs. Review learner progress efficiently through a centralized validation system.',
        icon: <Timer className="w-6 h-6" />,
        color: 'purple'
    },
    {
        title: 'Build Your Personal Brand',
        description: 'Establish yourself as a domain expert while mentoring students in a structured, high-impact environment.',
        icon: <Star className="w-6 h-6" />,
        color: 'rose'
    }
];

export default function MentorBenefitsSection() {
    return (
        <section className="py-24 bg-gray-50/50 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5693C1]/10 text-[#5693C1] text-xs font-bold uppercase tracking-wider mb-4 border border-[#5693C1]/20">
                        <CheckCircle2 className="w-3 h-3" />
                        For Verified Mentors
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        What Mentors Gain
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        RoleReady doesn’t just help students grow — it helps mentors build influence, credibility, and measurable impact.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mentorBenefits.map((benefit, index) => (
                        <div
                            key={index}
                            className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 shadow-sm
                ${benefit.color === 'blue' ? 'bg-blue-50 text-blue-600 border border-blue-100' : ''}
                ${benefit.color === 'cyan' ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' : ''}
                ${benefit.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : ''}
                ${benefit.color === 'amber' ? 'bg-amber-50 text-amber-600 border border-amber-100' : ''}
                ${benefit.color === 'purple' ? 'bg-purple-50 text-purple-600 border border-purple-100' : ''}
                ${benefit.color === 'rose' ? 'bg-rose-50 text-rose-600 border border-rose-100' : ''}
              `}>
                                {benefit.icon}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#5693C1] transition-colors">
                                {benefit.title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
