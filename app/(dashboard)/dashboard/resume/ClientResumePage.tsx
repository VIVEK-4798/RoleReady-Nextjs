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
                {/* Optimization Tips or Success State */}
                {hasWarnings ? (
                    <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl p-6 shadow-sm border border-blue-100 flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                            <Sparkles className="w-6 h-6 animate-pulse" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                Unlock Your Perfect Resume
                                <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">Highly Recommended</span>
                            </h3>
                            <div className="space-y-1.5">
                                {eligibility.warnings.slice(0, 3).map((warning, i) => (
                                    <p key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0" />
                                        {warning}
                                    </p>
                                ))}
                                {eligibility.warnings.length > 3 && (
                                    <p className="text-xs text-blue-500 font-bold pl-3 mt-1 cursor-help hover:underline decoration-dotted">
                                        View {eligibility.warnings.length - 3} more professional enhancements
                                    </p>
                                )}
                            </div>
                        </div>
                        <Link
                            href="/dashboard/profile"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-blue-500/25 active:scale-95 group"
                        >
                            Unlock Your Perfect Resume
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                ) : (
                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center justify-center gap-2">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <p className="text-emerald-800 text-sm font-bold tracking-tight">
                            ✨ You have successfully Unlocked your Perfect Resume! Your profile is fully optimized for AI enrichment.
                        </p>
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
