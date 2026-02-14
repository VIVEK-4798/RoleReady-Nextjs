'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Zap, Award, Sparkles } from 'lucide-react';

export default function PricingClient() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const plans = [
        {
            name: 'Free',
            price: { monthly: 0, yearly: 0 },
            description: 'Explore & Diagnose',
            subtitle: 'Best for exploring your readiness and understanding the basics.',
            icon: <Zap className="w-6 h-6 text-[#5693C1]" />,
            features: [
                'Profile & Resume Upload',
                'Skill Tracking Dashboard',
                'Choose 1 Target Role',
                'Basic Readiness Score',
                'Limited Roadmap Preview',
                'Basic Activity Reports',
                'Standard Community Support'
            ],
            cta: 'Get Started Free',
            href: '/signup',
            highlighted: false,
            badge: null
        },
        {
            name: 'Pro',
            price: { monthly: 199, yearly: 1990 },
            description: 'Serious Preparation',
            subtitle: 'Guided improvement for students actively preparing for jobs.',
            icon: <Sparkles className="w-6 h-6 text-white" />,
            features: [
                'Everything in Free',
                'Unlimited Readiness Scores',
                'Full Roadmap Engine',
                'Gap Prioritization Logic',
                'Full Progress History',
                'Mentor Validation Requests',
                'Activity Analytics',
                'Downloadable PDF Reports',
                'Smart Email Reminders',
                'Faster Review Queues'
            ],
            cta: 'Start Pro Journey',
            href: '/signup?plan=pro',
            highlighted: true,
            badge: 'Most Popular'
        },
        {
            name: 'Premium',
            price: { monthly: 999, yearly: 9900 },
            description: 'Maximum Confidence',
            subtitle: 'Expert-backed credibility for top-tier competitive roles.',
            icon: <Award className="w-6 h-6 text-[#5693C1]" />,
            features: [
                'Everything in Pro',
                'Priority Mentor Validations',
                'Ultra-fast Turnaround',
                'Deeper Review Feedback',
                'Profile Highlighting',
                'Advanced Readiness Insights',
                'Premium Analytics Reports',
                'Early Access to Features',
                'Future Recruiter Visibility'
            ],
            cta: 'Go Premium',
            href: '/signup?plan=premium',
            highlighted: false,
            badge: 'Limited Slots'
        }
    ];

    return (
        <div className="space-y-16 py-8">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
                <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-tight">
                    Simple, <span className="text-[#5693C1]">Result-Driven</span> Pricing.
                </h1>
                <p className="text-xl text-gray-500 font-medium leading-relaxed">
                    Invest in your future. Choose a plan that matches your career ambitions and start bridging your skill gaps today.
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center pt-4">
                    <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center shadow-inner border border-gray-200">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-8 py-2.5 rounded-xl text-sm font-black tracking-wide transition-all ${billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow-md transform scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-8 py-2.5 rounded-xl text-sm font-black tracking-wide transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white text-gray-900 shadow-md transform scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Yearly
                            <span className="px-2 py-0.5 bg-[#5693C1]/10 text-[#5693C1] text-[10px] rounded-full uppercase tracking-widest font-black">
                                Save 15%
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-8">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`p-10 rounded-[2.5rem] flex flex-col h-full transition-all duration-500 border relative group ${plan.highlighted
                            ? 'bg-gray-900 border-gray-900 text-white shadow-2xl scale-[1.05] z-10'
                            : 'bg-white border-gray-100 text-gray-900 hover:shadow-xl hover:-translate-y-2'
                            }`}
                    >
                        {plan.badge && (
                            <div className="absolute top-0 right-10 -mt-4 px-6 py-1.5 bg-[#5693C1] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg z-20">
                                {plan.badge}
                            </div>
                        )}

                        <div className="mb-10 text-center md:text-left">
                            <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center transition-transform group-hover:rotate-6 ${plan.highlighted ? 'bg-[#5693C1]/20' : 'bg-[#5693C1]/10'}`}>
                                {plan.icon}
                            </div>
                            <h3 className={`text-2xl font-black mb-1 ${plan.highlighted ? 'text-[#5693C1]' : 'text-gray-400'}`}>
                                {plan.name}
                            </h3>
                            <p className={`text-sm font-bold uppercase tracking-widest mb-6 ${plan.highlighted ? 'text-gray-400' : 'text-gray-300'}`}>
                                {plan.description}
                            </p>
                            <div className="flex items-baseline justify-center md:justify-start gap-1">
                                <span className="text-5xl font-black tracking-tight italic">₹{billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}</span>
                                {plan.price.monthly > 0 && (
                                    <span className={`text-sm font-bold ${plan.highlighted ? 'text-gray-500' : 'text-gray-400'}`}>
                                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                                    </span>
                                )}
                            </div>
                            <p className={`mt-6 text-sm font-medium leading-relaxed min-h-[40px] ${plan.highlighted ? 'text-gray-400' : 'text-gray-500'}`}>
                                {plan.subtitle}
                            </p>
                        </div>

                        <div className="space-y-4 mb-10 flex-grow">
                            <ul className="space-y-4">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm font-bold leading-tight">
                                        <div className={`mt-0.5 rounded-full p-0.5 shrink-0 ${plan.highlighted ? 'bg-[#5693C1]/20 text-[#5693C1]' : 'bg-[#5693C1]/10 text-[#5693C1]'}`}>
                                            <Check className="w-3.5 h-3.5" strokeWidth={4} />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Link
                            href={plan.href}
                            className={`block w-full text-center py-5 rounded-2xl font-black transition-all shadow-md active:scale-[0.98] ${plan.highlighted
                                ? 'bg-white text-gray-900 hover:bg-gray-100 hover:shadow-white/10'
                                : 'bg-[#5693C1] text-white hover:bg-[#4a80b0] hover:shadow-blue-200'
                                }`}
                        >
                            {plan.cta}
                        </Link>
                    </div>
                ))}
            </div>

            <div className="max-w-4xl mx-auto p-10 lg:p-14 bg-gray-50 rounded-[3.5rem] text-center space-y-6 border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#5693C1] group-hover:w-full transition-all duration-700 opacity-[0.03] pointer-events-none" />
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Custom Enterprise Solutions</h3>
                <p className="text-gray-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed text-left md:text-center">
                    Looking for team-based training or university partnerships? Let's build a custom program with private mentors and advanced analytics for your organization.
                </p>
                <Link href="/contact" className="inline-flex items-center gap-3 bg-white px-10 py-4 rounded-2xl text-[#5693C1] font-black shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all">
                    Talk to Sales Team
                    <Check className="w-4 h-4" strokeWidth={3} />
                </Link>
            </div>
        </div>
    );
}
