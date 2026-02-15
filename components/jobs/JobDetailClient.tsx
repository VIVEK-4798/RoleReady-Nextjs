'use client';

import { useJobDetails } from '@/hooks/useJobs';
import { useParams, useRouter } from 'next/navigation';
import {
    Building2,
    MapPin,
    Briefcase,
    ArrowLeft,
    ExternalLink,
    ShieldCheck,
    Target,
    Share2,
    Bookmark
} from 'lucide-react';
import { LandingHeader } from '@/components/home';
import PublicFooter from '@/components/layout/PublicFooter';
import { useAuth } from '@/hooks';
import Link from 'next/link';

export default function JobDetailClient() {
    const { isAuthenticated } = useAuth();
    const { id } = useParams() as { id: string };
    const { job, loading, error } = useJobDetails(id);
    const router = useRouter();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <LandingHeader isAuthenticated={isAuthenticated} />
                <div className="max-w-7xl mx-auto pt-32 px-4 md:px-8">
                    <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mb-8" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="h-12 w-3/4 bg-gray-200 animate-pulse rounded" />
                            <div className="h-6 w-1/4 bg-gray-200 animate-pulse rounded" />
                            <div className="h-64 w-full bg-gray-200 animate-pulse rounded" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <LandingHeader isAuthenticated={isAuthenticated} />
                <div className="max-w-7xl mx-auto pt-32 px-4 md:px-8 text-center">
                    <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 max-w-lg mx-auto">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Opportunity Not Found</h1>
                        <p className="text-gray-600 mb-8">This job listing may have expired or is no longer available.</p>
                        <Link href="/jobs" className="px-6 py-3 bg-[#5693C1] text-white font-bold rounded-xl active:scale-[0.98]">
                            Back to Opportunities
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <LandingHeader isAuthenticated={isAuthenticated} />

            <main className="max-w-7xl mx-auto pt-32 pb-20 px-4 md:px-8">
                {/* Navigation */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#5693C1] transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to discovery</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Job Detail */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm relative overflow-hidden">
                            {/* Background Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#5693C1]/5 rounded-full blur-3xl -mr-32 -mt-32" />

                            <header className="relative z-10">
                                <div className="flex flex-wrap items-center gap-3 mb-6">
                                    <span className="px-3 py-1 bg-[#5693C1]/10 text-[#5693C1] text-xs font-bold rounded-lg uppercase tracking-wider">
                                        {job.employmentType}
                                    </span>
                                    <span className="text-sm text-gray-400 font-medium">
                                        Posted on {new Date(job.postedAt || '').toLocaleDateString()}
                                    </span>
                                </div>

                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                                    {job.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-[#5693C1]" />
                                        <span className="font-semibold text-lg">{job.company}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-gray-400" />
                                        <span>{job.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-gray-400" />
                                        <span>{job.employmentType}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <a
                                        href={job.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-8 py-4 bg-[#5693C1] text-white font-bold rounded-xl shadow-lg shadow-[#5693C1]/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
                                    >
                                        Apply on Employer Site
                                        <ExternalLink className="w-5 h-5" />
                                    </a>

                                    <button className="p-4 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#5693C1] hover:border-[#5693C1] transition-all">
                                        <Bookmark className="w-5 h-5" />
                                    </button>
                                    <button className="p-4 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#5693C1] hover:border-[#5693C1] transition-all">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </header>
                        </section>

                        {/* Redirection Notice - CRITICAL */}
                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-orange-100 flex items-center justify-center flex-shrink-0">
                                <ExternalLink className="w-6 h-6 text-orange-500" />
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-orange-900 font-bold mb-1">Redirection Notice</p>
                                <p className="text-orange-800/80 text-sm leading-relaxed">
                                    Applications are completed on the employer's official website. You will be redirected there to submit your information. RoleReady help you evaluate readiness, but does not process applications.
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <section className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-50">Job Description</h2>
                            <div
                                className="prose prose-blue max-w-none text-gray-700 leading-relaxed space-y-4"
                                dangerouslySetInnerHTML={{ __html: job.description || 'No description provided.' }}
                            />
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Quick Actions Card */}
                        <div className="bg-[#5693C1] rounded-3xl p-8 text-white shadow-xl shadow-[#5693C1]/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />

                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6" />
                                Readiness Hint
                            </h3>
                            <p className="text-white/80 text-sm leading-relaxed mb-8">
                                Want to know if you're qualified for this {job.title} role? RoleReady can analyze your profile against this role's requirements.
                            </p>

                            <Link
                                href="/dashboard/readiness"
                                className="w-full h-14 bg-white text-[#5693C1] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-lg active:scale-[0.98]"
                            >
                                Analyze My Readiness
                                <Target className="w-5 h-5" />
                            </Link>
                        </div>

                        {/* Job Summary Sidebar */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Opportunity Summary</h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Company</p>
                                    <p className="text-gray-900 font-semibold">{job.company}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Location</p>
                                    <p className="text-gray-900 font-semibold">{job.location}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Job Type</p>
                                    <p className="text-gray-900 font-semibold">{job.employmentType}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Estimated Salary</p>
                                    <p className="text-gray-900 font-semibold text-[#5693C1]">{job.salary || 'Not disclosed'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Source</p>
                                    <p className="text-gray-900 font-semibold flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                                        Verified JoinRise Partner
                                    </p>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-gray-50 text-center">
                                <button className="text-sm font-bold text-gray-500 hover:text-[#5693C1] transition-colors">
                                    Report this listing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
