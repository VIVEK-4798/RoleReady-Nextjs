'use client';

import { useParams, useRouter } from 'next/navigation';
import { useInternshipDetails } from '@/hooks/useInternships';
import { LandingHeader } from '@/components/home';
import PublicFooter from '@/components/layout/PublicFooter';
import { useAuth } from '@/hooks';
import {
    MapPin,
    Building2,
    Calendar,
    ArrowLeft,
    ExternalLink,
    DollarSign,
    AlertCircle,
    CheckCircle2,
    Shield
} from 'lucide-react';
import Link from 'next/link';

export default function InternshipDetailClient() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const id = params.id as string;
    const { internship, loading, error } = useInternshipDetails(id);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <LandingHeader isAuthenticated={isAuthenticated} />
                <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-4 w-32 bg-gray-100 rounded mb-8" />
                        <div className="h-12 w-3/4 bg-gray-100 rounded mb-4" />
                        <div className="h-6 w-1/2 bg-gray-100 rounded mb-12" />
                        <div className="h-64 w-full bg-gray-100 rounded mb-8" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !internship) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <LandingHeader isAuthenticated={isAuthenticated} />
                <div className="pt-32 pb-20 px-4 text-center max-w-xl mx-auto">
                    <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Internship Not Found</h2>
                    <p className="text-gray-500 mb-8">This listing may have expired or is no longer available.</p>
                    <Link href="/internships" className="px-8 py-3 bg-[#5693C1] text-white font-bold rounded-xl hover:bg-[#4a80b0] transition-all">
                        Back to Internships
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <LandingHeader isAuthenticated={isAuthenticated} />

            <main className="pt-32 pb-20 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Navigation */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-[#5693C1] font-medium mb-10 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Opportunities
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Main Info */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                                <span className="inline-block px-3 py-1 bg-[#5693C1]/5 text-[#5693C1] text-[10px] font-bold uppercase tracking-wider rounded-full mb-6 border border-[#5693C1]/10">
                                    {internship.source} Candidate Discovery
                                </span>

                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                    {internship.title}
                                </h1>

                                <div className="flex flex-wrap gap-6 text-gray-600 mb-10">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-gray-400" />
                                        <span className="font-semibold">{internship.company}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-[#5693C1]" />
                                        <span>{internship.remote ? 'Remote' : (internship.location || 'India')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <span>{internship.duration || '3-6 Months'}</span>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            Overview
                                        </h3>
                                        <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                            {internship.description}
                                        </div>
                                    </div>

                                    <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
                                        <h3 className="text-sm font-bold text-[#5693C1] uppercase tracking-wider mb-4">Financial Support</h3>
                                        <div className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                                            <DollarSign className="w-6 h-6 text-[#5693C1]" />
                                            {internship.stipend || 'Competitive Stipend'}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 italic">As per company disclosure at the time of aggregation.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar CTA */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-32 space-y-6">
                                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-[#5693C1]/5 border-t-4 border-t-[#5693C1]">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 leading-tight">Apply to {internship.company}</h3>

                                    <div className="bg-gray-50 rounded-xl p-4 mb-8">
                                        <div className="flex gap-3">
                                            <Shield className="w-5 h-5 text-[#5693C1] shrink-0" />
                                            <p className="text-xs text-gray-600 leading-relaxed">
                                                <strong>Redirect Notice:</strong> Applications are handled on the employer's official website. You will be redirected.
                                            </p>
                                        </div>
                                    </div>

                                    <a
                                        href={internship.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full inline-flex items-center justify-center gap-3 py-4 bg-[#5693C1] text-white font-bold rounded-xl hover:bg-[#4a80b0] transition-all transform hover:scale-[1.02] shadow-lg shadow-[#5693C1]/20 group"
                                    >
                                        Apply on Site
                                        <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </a>

                                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest leading-relaxed">
                                            Verified aggregation source: {internship.source}<br />
                                            Aggregated from external sources.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-[#5693C1] to-[#4a80b0] rounded-3xl p-8 text-white shadow-lg">
                                    <h4 className="font-bold mb-3">Want a Readiness Review?</h4>
                                    <p className="text-sm opacity-90 mb-6">Our AI can evaluate how ready you are for this specific internship based on your skills.</p>
                                    <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all backdrop-blur-sm border border-white/10">
                                        Check Readiness (Soon)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
