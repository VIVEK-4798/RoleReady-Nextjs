'use client';

import { Shield, CheckCircle2 } from 'lucide-react';

interface VerifiedMentorBadgeProps {
    variant?: 'default' | 'compact' | 'inline';
    className?: string;
}

export default function VerifiedMentorBadge({
    variant = 'default',
    className = ''
}: VerifiedMentorBadgeProps) {

    if (variant === 'inline') {
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 bg-[#5693C1]/10 text-[#5693C1] text-xs font-semibold rounded-full border border-[#5693C1]/20 ${className}`}>
                <Shield className="w-3 h-3" />
                Verified
            </span>
        );
    }

    if (variant === 'compact') {
        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#5693C1]/10 to-cyan-100/50 text-[#5693C1] text-sm font-semibold rounded-lg border border-[#5693C1]/20 ${className}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Mentor</span>
            </div>
        );
    }

    return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border-2 border-[#5693C1]/30 shadow-sm hover:shadow-md transition-shadow ${className}`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5693C1] to-cyan-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
                <div className="text-xs text-gray-500 font-medium">Status</div>
                <div className="text-sm font-bold text-gray-900">Verified Mentor</div>
            </div>
        </div>
    );
}
