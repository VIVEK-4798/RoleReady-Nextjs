'use client';

import Link from 'next/link';
import { Briefcase, Plus, Sparkles } from 'lucide-react';

interface PostOpportunityCardProps {
    jobsCount: number;
    internshipsCount: number;
}

export default function PostOpportunityCard({ jobsCount, internshipsCount }: PostOpportunityCardProps) {
    const totalPosts = jobsCount + internshipsCount;

    return (
        <div className="bg-gradient-to-br from-[#5693C1]/5 to-cyan-50/30 rounded-2xl p-6 border-2 border-[#5693C1]/20 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5693C1] to-cyan-500 flex items-center justify-center shadow-sm">
                        <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Post Opportunities for Free</h3>
                        <p className="text-sm text-gray-500">Share jobs & internships with verified learners</p>
                    </div>
                </div>
                <div className="px-3 py-1 bg-white rounded-full text-xs font-bold text-[#5693C1] border border-[#5693C1]/20 shadow-sm">
                    FREE
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Jobs Posted</div>
                    <div className="text-xl font-bold text-gray-900">{jobsCount}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Internships Posted</div>
                    <div className="text-xl font-bold text-gray-900">{internshipsCount}</div>
                </div>
            </div>

            {/* Benefits */}
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white">
                <div className="flex items-start gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#5693C1] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">
                        Attract candidates aligned with your expectations from our verified talent pool
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <Link
                    href="/mentor/jobs/create"
                    className="group h-11 bg-white text-[#5693C1] border-2 border-[#5693C1] rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#5693C1] hover:text-white transition-all duration-200"
                >
                    <Plus className="w-4 h-4" />
                    Post Job
                </Link>
                <Link
                    href="/mentor/internships/create"
                    className="group h-11 bg-gradient-to-r from-[#5693C1] to-cyan-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]"
                >
                    <Plus className="w-4 h-4" />
                    Post Internship
                </Link>
            </div>

            {totalPosts > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                        href="/mentor/jobs"
                        className="text-sm text-[#5693C1] font-medium hover:underline flex items-center justify-center gap-1"
                    >
                        View all your postings
                        <span>→</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
