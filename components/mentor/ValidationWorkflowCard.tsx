'use client';

import Link from 'next/link';
import { ClipboardList, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

interface ValidationWorkflowCardProps {
    pendingCount: number;
}

export default function ValidationWorkflowCard({ pendingCount }: ValidationWorkflowCardProps) {
    return (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5693C1] to-cyan-500 flex items-center justify-center shadow-sm">
                        <ClipboardList className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Centralized Validation Workflow</h3>
                        <p className="text-sm text-gray-500">Structured review system</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {/* Status Overview */}
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Pending Reviews</div>
                            <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
                        </div>
                    </div>
                    {pendingCount > 0 && (
                        <div className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                            Action Required
                        </div>
                    )}
                </div>

                {/* Benefits List */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-[#5693C1]" />
                        <span>No scattered resume reviews or random DMs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-[#5693C1]" />
                        <span>Centralized queue with priority sorting</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-[#5693C1]" />
                        <span>Track learner progress efficiently</span>
                    </div>
                </div>

                {/* CTA Button */}
                <Link
                    href="/mentor/validation-queue"
                    className="group w-full h-12 bg-gradient-to-r from-[#5693C1] to-cyan-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]"
                >
                    Go to Validation Queue
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}
