'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { useAuth } from '@/hooks';
import toast from 'react-hot-toast';
import { Check, Zap, Award, Sparkles } from 'lucide-react';

export default function PricingClient() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const { user } = useAuth();
    const router = useRouter();

    const handlePlanClick = (planName: string) => {
        if (!user) {
            router.push('/auth/signin');
            return;
        }

        if (planName === 'Free') {
            router.push('/dashboard');
        } else if (planName === 'Pro' || planName === 'Premium') {
            handlePayment(planName.toUpperCase() as "PRO" | "PREMIUM");
        }
    };

    const handlePayment = async (plan: "PRO" | "PREMIUM") => {
        try {
            const res = await fetch("/api/payment/create-order", {
                method: "POST",
                body: JSON.stringify({ plan, billingCycle }),
            });

            if (!res.ok) throw new Error("Could not create order");
            const order = await res.json();

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: "INR",
                name: "RoleReady",
                description: `${plan} Plan Upgrade`,
                order_id: order.id,

                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch("/api/payment/verify", {
                            method: "POST",
                            body: JSON.stringify(response),
                        });

                        if (!verifyRes.ok) throw new Error("Payment verification failed");

                        toast.success(`Plan upgraded successfully to ${plan}!`);
                        router.push("/dashboard");
                    } catch (err: any) {
                        toast.error(err.message || "Something went wrong verifying payment");
                    }
                },
            };

            const rzp = new (window as any).Razorpay(options);
            
            rzp.on('payment.failed', function (response: any){
               toast.error("Payment failed. Please try again.");
            });
            
            rzp.open();
        } catch (error: any) {
            toast.error(error.message || "Failed to initialize payment");
        }
    };

    const plans = [
        {
            name: 'Free',
            price: { monthly: 0, yearly: 0 },
            description: 'Explore & Diagnose',
            subtitle: 'Best for understanding your current readiness before committing.',
            icon: <Zap className="w-6 h-6 text-[#5693C1]" />,
            features: [
                'Profile creation & resume upload',
                'Skill tracking dashboard',
                '1 target role selection',
                'Up to 3 readiness score calculations',
                'Limited roadmap generation (preview only / 1 full)',
                'Resume generation (1 time only)',
                'Skill extraction from resume (2 times)',
                'Up to 3 mentor validation requests',
                '1 support ticket',
                'Basic progress tracking'
            ],
            cta: 'Get Started Free',
            href: '/signup',
            highlighted: false,
            badge: null
        },
        {
            name: 'Pro',
            price: { monthly: 199, yearly: 1999 },
            description: 'Structured Improvement',
            subtitle: 'Designed for consistent preparation with generous monthly limits.',
            icon: <Sparkles className="w-6 h-6 text-white" />,
            features: [
                'Everything in Free +',
                '25/month readiness score calculations',
                '10/month full roadmap generations',
                '10/month resume generations',
                '15/month skill extractions',
                '10/month mentor validation requests',
                'Downloadable reports (PDF)',
                'Progress tracking with history',
                'Faster processing'
            ],
            cta: 'Start Pro Journey',
            href: '/signup?plan=pro',
            highlighted: true,
            badge: 'Most Popular'
        },
        {
            name: 'Premium',
            price: { monthly: 499, yearly: 4999 },
            description: 'Maximum Confidence',
            subtitle: 'Unlimited access with priority validation and deeper insights.',
            icon: <Award className="w-6 h-6 text-[#5693C1]" />,
            features: [
                'Everything in Pro +',
                'Priority mentor validation',
                'Faster turnaround time',
                'Deeper feedback on skills/projects',
                'Advanced readiness insights',
                'Profile highlighting (future recruiter visibility)',
                'Premium analytics'
            ],
            cta: 'Go Premium',
            href: '/signup?plan=premium',
            highlighted: false,
            badge: 'Limited Slots'
        }
    ];

    return (
        <div className="space-y-16 py-8">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            
            <div className="text-center space-y-6 max-w-3xl mx-auto">
                <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-tight">
                    Simple, <span className="text-[#5693C1]">Transparent</span> Pricing
                </h1>
                <p className="text-xl text-gray-500 font-medium leading-relaxed">
                    Start free, understand your gaps, and upgrade when you're ready to improve seriously.
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

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr_1fr] gap-6 lg:gap-8 max-w-7xl mx-auto items-stretch pt-12 px-4 xl:px-0">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`p-10 rounded-[2.5rem] flex flex-col h-full transition-all duration-500 border relative group ${plan.highlighted
                            ? 'bg-[#1e293b] border-[#334155] text-white shadow-2xl lg:-mt-4 z-10'
                            : 'bg-white border-gray-100 text-gray-900 hover:shadow-xl'
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
                            <p className={`mt-6 text-sm font-medium leading-relaxed min-h-[40px] ${plan.highlighted ? 'text-gray-300' : 'text-gray-500'}`}>
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

                        <button
                            onClick={() => handlePlanClick(plan.name)}
                            className={`block w-full text-center py-5 rounded-2xl font-black transition-all shadow-md active:scale-[0.98] ${plan.highlighted
                                ? 'bg-[#5693C1] text-white hover:bg-[#4a80b0]'
                                : 'bg-[#e2e8f0] text-gray-900 hover:bg-[#cbd5e1]'
                                }`}
                        >
                            {plan.cta}
                        </button>
                    </div>
                ))}
            </div>

            {/* Feature Comparison Table */}
            <div className="max-w-4xl mx-auto py-16">
                <h3 className="text-3xl font-black text-center text-gray-900 mb-10">Compare Features</h3>
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="p-4 border-b border-gray-200 font-semibold text-gray-900">Feature</th>
                                <th className="p-4 border-b border-gray-200 font-semibold text-center text-gray-900">Free</th>
                                <th className="p-4 border-b border-gray-200 font-semibold text-center text-[#5693C1]">Pro</th>
                                <th className="p-4 border-b border-gray-200 font-semibold text-center text-[#5693C1]">Premium</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            <tr>
                                <td className="p-4 text-gray-700 font-medium">Readiness checks</td>
                                <td className="p-4 text-center font-semibold text-gray-600">3</td>
                                <td className="p-4 text-center font-bold text-[#5693C1]">25/month</td>
                                <td className="p-4 text-center font-bold text-[#5693C1]">Unlimited</td>
                            </tr>
                            <tr>
                                <td className="p-4 text-gray-700 font-medium">Roadmap Generations</td>
                                <td className="p-4 text-center font-semibold text-gray-600">1</td>
                                <td className="p-4 text-center font-bold text-[#5693C1]">10/month</td>
                                <td className="p-4 text-center font-bold text-[#5693C1]">Unlimited</td>
                            </tr>
                            <tr>
                                <td className="p-4 text-gray-700 font-medium">Resume Generations</td>
                                <td className="p-4 text-center font-semibold text-gray-600">1</td>
                                <td className="p-4 text-center font-bold text-[#5693C1]">10/month</td>
                                <td className="p-4 text-center font-bold text-[#5693C1]">Unlimited</td>
                            </tr>
                            <tr>
                                <td className="p-4 text-gray-700 font-medium">Skill Extractions</td>
                                <td className="p-4 text-center font-semibold text-gray-600">2</td>
                                <td className="p-4 text-center font-bold text-[#5693C1]">15/month</td>
                                <td className="p-4 text-center font-bold text-[#5693C1]">Unlimited</td>
                            </tr>
                            <tr>
                                <td className="p-4 text-gray-700 font-medium">Mentor Requests</td>
                                <td className="p-4 text-center font-semibold text-gray-600">3</td>
                                <td className="p-4 text-center font-bold text-[#5693C1]">10/month</td>
                                <td className="p-4 text-center font-bold text-[#5693C1]">Unlimited</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
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
