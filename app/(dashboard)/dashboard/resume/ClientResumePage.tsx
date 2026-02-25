'use client';

import React, { useState } from 'react';
import { ResumeData, ResumeEligibility } from '@/types/resume';
import ResumePreview from '@/components/resume/ResumePreview';
import { toast } from 'react-hot-toast';
import { Lightbulb, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface ClientResumePageProps {
    initialData: ResumeData;
    eligibility: ResumeEligibility;
}

export default function ClientResumePage({ initialData, eligibility }: ClientResumePageProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const hasWarnings = eligibility.warnings.length > 0;

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch('/api/resume/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(initialData),
            });

            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }

            // Handle binary response
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Resume_${initialData.contact.fullName.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Resume downloaded successfully!');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to generate PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-8 px-4">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* CRITICAL: Perfect Resume Optimization CTA - ALWAYS AT TOP */}
                {hasWarnings ? (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-2xl shadow-blue-500/30 border border-blue-400/30 text-white relative overflow-hidden group">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />

                        <div className="relative flex flex-col md:flex-row items-center gap-8 justify-between">
                            <div className="space-y-4 max-w-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                                        <Sparkles className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight">
                                        Unlock Your Perfect Resume
                                    </h3>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-blue-50 font-medium">To enable deep AI enrichment and professional formatting, the following fields are highly recommended:</p>
                                    <div className="flex flex-wrap gap-4 pt-1">
                                        {eligibility.warnings.slice(0, 4).map((warning, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 text-xs font-bold whitespace-nowrap">
                                                <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
                                                {warning.split('(')[0].trim()}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <Link
                                href="/dashboard/profile"
                                className="bg-white text-blue-600 px-10 py-5 rounded-2xl text-base font-black transition-all flex items-center gap-3 shrink-0 shadow-2xl hover:scale-105 active:scale-95 group/btn"
                            >
                                Optimize Now
                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-500 rounded-3xl p-6 border border-emerald-400 flex items-center justify-between gap-6 text-white shadow-xl shadow-emerald-500/20">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <p className="text-lg font-bold">✨ You have successfully Unlocked your Perfect Resume!</p>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">Profile: 100% Optimized</div>
                    </div>
                )}

                <ResumePreview
                    data={initialData}
                    onDownload={handleDownload}
                    isDownloading={isDownloading}
                />
            </div>
        </div>
    );
}
