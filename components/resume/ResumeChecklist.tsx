'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, User, GraduationCap, Briefcase, Code, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResumeChecklistProps {
    missingFields: string[];
    warnings: string[];
}

export default function ResumeChecklist({ missingFields, warnings }: ResumeChecklistProps) {
    // Definitive list of requirements to display, matching the hardened service logic
    const requirements = [
        {
            id: 'contact',
            label: 'Full contact details',
            desc: 'Name, Email, Phone, and LinkedIn or GitHub',
            icon: <Phone className="w-5 h-5" />,
            check: 'Full contact details (Name, Email, Phone, and LinkedIn/GitHub)'
        },
        {
            id: 'education',
            label: 'Education entry',
            desc: 'At least 1 degree with institution and graduation year',
            icon: <GraduationCap className="w-5 h-5" />,
            check: 'At least 1 valid education entry (Degree, Institution, and Year)'
        },
        {
            id: 'skills',
            label: '5+ Technical Skills',
            desc: 'Minimum 5 skills, with 2+ at Intermediate level or higher',
            icon: <Code className="w-5 h-5" />,
            check: 'At least 5 skills (with minimum 2 at Intermediate level or higher)'
        },
        {
            id: 'experience',
            label: 'Detailed experience or projects',
            desc: '1 detailed work role OR 2 projects (min 80 chars description)',
            icon: <Briefcase className="w-5 h-5" />,
            check: '1 detailed work experience (80+ chars) OR 2 detailed projects (80+ chars each)'
        }
    ];

    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden"
            >
                {/* Header Container */}
                <div className="p-8 md:p-10 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-[#5693C1]/10 rounded-2xl flex items-center justify-center text-[#5693C1]">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Resume Quality Check</h2>
                            <p className="text-gray-500">To maintain professional standards, your profile must meet the following criteria.</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-10 space-y-10">
                    {/* Hard Requirements Section */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            Required for professional generation
                        </h3>

                        <div className="grid gap-4">
                            {requirements.map((req) => {
                                const isMissing = missingFields.includes(req.check);
                                return (
                                    <div
                                        key={req.id}
                                        className={`group flex items-center gap-5 p-5 rounded-2xl border-2 transition-all duration-300 ${isMissing
                                                ? 'bg-red-50/20 border-red-100/50 hover:border-red-200'
                                                : 'bg-emerald-50/20 border-emerald-100/50 hover:border-emerald-200'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-xl transition-colors ${isMissing ? 'bg-red-100/50 text-red-600' : 'bg-emerald-100/50 text-emerald-600'
                                            }`}>
                                            {req.icon}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className={`font-bold ${isMissing ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {req.label}
                                                </h4>
                                                {!isMissing && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                            </div>
                                            <p className={`text-sm ${isMissing ? 'text-gray-500' : 'text-gray-400 font-medium'}`}>
                                                {req.desc}
                                            </p>
                                        </div>

                                        {isMissing && (
                                            <div className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <XCircle className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Warnings / Soft Recommendations */}
                    {warnings.length > 0 && (
                        <div className="p-6 bg-amber-50/30 rounded-2xl border border-amber-100/50">
                            <h3 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Soft Warnings (Non-blocking)
                            </h3>
                            <div className="space-y-2">
                                {warnings.map((warning, i) => (
                                    <div key={i} className="text-sm text-amber-800 flex items-start gap-2">
                                        <div className="w-1 h-1 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                                        {warning}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-2">
                        <Link
                            href="/dashboard/profile"
                            className="w-full py-5 bg-[#5693C1] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#4a80b0] hover:-translate-y-1 active:scale-[0.98] transition-all shadow-xl shadow-[#5693C1]/20 group"
                        >
                            Complete My Profile
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="px-10 py-6 bg-gray-50 border-t border-gray-100">
                    <p className="text-center text-xs text-gray-400 font-medium leading-relaxed">
                        Why these rules? Low-quality resumes are automatically filtered by AI-driven ATS systems.
                        Meeting these standards ensures your resume gets read by human recruiters.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
