'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { Check, Info, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { forwardRef } from 'react';

const UsagePlansSection = forwardRef<HTMLElement>((props, ref) => {
  const { user } = useAuth();
  const router = useRouter();
  const isAuthenticated = !!user;

  const navigateTo = (authRoute: string, appRoute: string) => {
    if (!isAuthenticated) return router.push(authRoute);
    return router.push(appRoute);
  };

  return (
    <section ref={ref} id="usage-plans" className="py-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            3 free readiness checks included — no payment required
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Start Free. Upgrade When You’re Ready.
          </h2>
          <p className="text-lg text-gray-600">
            Understand your current readiness, use your free benefits, and upgrade only when you need more.
            <br />
            <span className="mt-2 text-sm font-medium text-[#5693C1]">No hidden limits. No forced upgrades.</span>
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          
          {/* FREE PLAN */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-[#5693C1]/20 hover:border-[#5693C1]/50 transition-all flex flex-col relative">
            <div className="absolute top-0 right-0 bg-[#5693C1] text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
              ENTRY
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free Plan</h3>
              <p className="text-gray-500 text-sm">Explore Your Readiness</p>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1 flex items-baseline gap-1">
              ₹0 <span className="text-sm font-medium text-gray-500">/ forever</span>
            </div>
            <p className="text-sm font-medium text-gray-600 bg-gray-50 py-2 px-3 rounded-lg my-4">
              Perfect for understanding where you stand before committing.
            </p>
            <ul className="space-y-4 flex-1 mb-8">
              {[
                "3 Readiness Score Calculations",
                "1 Full Roadmap Generation",
                "1 Resume Generation",
                "2 Skill Extractions from Resume",
                "3 Mentor Validation Requests",
                "1 Support Ticket"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium text-sm leading-snug">{feature}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => navigateTo('/auth/signin', '/dashboard')}
              className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition-colors border border-gray-200 shadow-sm"
            >
              Get Started Free
            </button>
          </div>

          {/* PRO PLAN */}
          <div className="bg-gray-900 rounded-2xl p-8 shadow-xl transform md:-translate-y-4 flex flex-col relative text-white">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md w-max">
              MOST POPULAR
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Pro Plan</h3>
              <p className="text-gray-400 text-sm">Structured Improvement</p>
            </div>
            <div className="text-3xl font-black text-white mb-1 flex items-baseline gap-1">
              <span className="text-lg">₹</span>199 <span className="text-sm font-medium text-gray-400">/ month</span>
            </div>
            <p className="text-sm font-medium text-gray-300 bg-gray-800 py-2 px-3 rounded-lg my-4">
              Designed for consistent preparation with generous monthly limits.
            </p>
            <ul className="space-y-4 flex-1 mb-8">
              {[
                "25 Readiness Checks / month",
                "10 Roadmaps / month",
                "10 Resume Generations / month",
                "15 Skill Extractions / month",
                "10 Mentor Requests / month"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-200 font-medium text-sm leading-snug">{feature}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => navigateTo('/auth/signin', '/pricing')}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/25 border border-blue-400"
            >
              Start Pro Journey
            </button>
          </div>

          {/* PREMIUM PLAN */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-transparent hover:border-gray-200 transition-all flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Premium</h3>
              <p className="text-gray-500 text-sm">Unlimited Access</p>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1 flex items-baseline gap-1">
              <span className="text-lg">₹</span>499 <span className="text-sm font-medium text-gray-500">/ month</span>
            </div>
            <p className="text-sm font-medium text-gray-600 bg-gray-50 py-2 px-3 rounded-lg my-4">
              Built for serious candidates aiming for top-tier roles.
            </p>
            <ul className="space-y-4 flex-1 mb-8">
              {[
                "Unlimited access to all features",
                "Priority mentor validation",
                "Faster feedback & deeper insights"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium text-sm leading-snug">{feature}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => navigateTo('/auth/signin', '/pricing')}
              className="w-full py-3.5 bg-white hover:bg-gray-50 text-[#5693C1] font-bold rounded-xl transition-colors border border-[#5693C1] shadow-sm"
            >
              Go Premium
            </button>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-4xl mx-auto overflow-hidden">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="py-4 px-6 text-sm font-bold text-gray-900 w-1/4 tracking-wider">FEATURE</th>
                  <th className="py-4 px-6 text-sm font-bold text-gray-600 w-1/4 text-center">Free</th>
                  <th className="py-4 px-6 text-sm font-bold text-blue-700 w-1/4 text-center bg-blue-50/50">Pro</th>
                  <th className="py-4 px-6 text-sm font-bold text-purple-700 w-1/4 text-center">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm font-semibold text-gray-800">Readiness</td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-600 text-center">3</td>
                  <td className="py-4 px-6 text-sm font-bold text-blue-700 text-center bg-blue-50/20">25/mo</td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-900 text-center">Unlimited</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm font-semibold text-gray-800">Roadmaps</td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-600 text-center">1</td>
                  <td className="py-4 px-6 text-sm font-bold text-blue-700 text-center bg-blue-50/20">10/mo</td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-900 text-center">Unlimited</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm font-semibold text-gray-800">Resume</td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-600 text-center">1</td>
                  <td className="py-4 px-6 text-sm font-bold text-blue-700 text-center bg-blue-50/20">10/mo</td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-900 text-center">Unlimited</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left text-sm text-gray-500 font-medium bg-white border border-gray-100 py-3 px-4 sm:px-6 rounded-xl w-full sm:w-auto max-w-full lg:w-max mx-auto shadow-sm">
            <Info className="w-5 h-5 flex-shrink-0 text-[#5693C1]" />
            <span>You’ll always see how much of your free usage is left inside your personalized dashboard.</span>
          </div>
        </div>
      </div>
    </section>
  );
});

UsagePlansSection.displayName = 'UsagePlansSection';

export default UsagePlansSection;
