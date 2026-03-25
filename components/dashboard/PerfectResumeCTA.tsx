'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PerfectResumeCTA() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show after a small delay for better entrance
        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-[#5693C1] to-[#4a80b0] rounded-2xl p-6 shadow-xl shadow-blue-500/10 mb-6 group">
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-4 sm:gap-5 text-center sm:text-left">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-inner shrink-0 animate-pulse">
                        <Sparkles className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                            Unlock Your Perfect Resume
                        </h3>
                        <p className="text-blue-50 text-sm leading-relaxed max-w-md w-full">
                            Your profile is almost ready! Complete your "About," "Certifications," and "Achievements" to unlock deep AI enrichment and standard-setting formatting.
                        </p>
                    </div>
                </div>

                <Link
                    href="/dashboard/resume"
                    className="flex items-center justify-center w-full md:w-auto gap-2 px-8 py-4 bg-white text-[#5693C1] font-bold rounded-xl hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all shadow-lg group shrink-0"
                >
                    Unlock Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Decorative Stars */}
            <div className="absolute top-4 right-1/4 opacity-40 animate-bounce delay-75">✨</div>
            <div className="absolute bottom-4 left-1/3 opacity-30 animate-bounce delay-150">✨</div>
        </div>
    );
}
