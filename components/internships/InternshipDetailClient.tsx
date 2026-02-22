'use client';

import { useParams, useRouter } from 'next/navigation';
import { useInternshipDetails } from '@/hooks/useInternships';
import { LandingHeader } from '@/components/home';
import PublicFooter from '@/components/layout/PublicFooter';
import { useAuth } from '@/hooks';
import { motion } from 'framer-motion';
import {
    MapPin,
    Building2,
    Calendar,
    ArrowLeft,
    ExternalLink,
    DollarSign,
    AlertCircle,
    CheckCircle2,
    Shield,
    Briefcase,
    Users,
    Clock,
    Award,
    Sparkles,
    Heart,
    Share2,
    Bookmark,
    TrendingUp,
    GraduationCap,
    Zap,
    Target,
    Globe,
    Mail,
    Phone,
    Link2,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function InternshipDetailClient() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const id = params.id as string;
    const { internship, loading, error } = useInternshipDetails(id);
    const [isSaved, setIsSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'about'>('overview');

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <LandingHeader isAuthenticated={isAuthenticated} />
                <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        {/* Skeleton loader */}
                        <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="h-12 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="h-6 w-1/2 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
                            </div>
                            <div className="lg:col-span-1">
                                <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (error || !internship) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <LandingHeader isAuthenticated={isAuthenticated} />
                <div className="pt-32 pb-20 px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-xl mx-auto text-center"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full blur-3xl" />
                            <div className="relative bg-white rounded-3xl border border-gray-200 p-12 shadow-xl">
                                <AlertCircle className="w-20 h-20 text-orange-500 mx-auto mb-6" />
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">Internship Not Found</h2>
                                <p className="text-gray-500 mb-8">
                                    This listing may have expired or is no longer available. Check out our latest opportunities below.
                                </p>
                                <Link
                                    href="/internships"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 group"
                                >
                                    Browse Opportunities
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Helper to format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Recently';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Helper to format stipend
    const formatStipend = (stipend?: string | null) => {
        if (!stipend) return 'Competitive Stipend';
        if (stipend.toLowerCase().includes('competitive')) return stipend;
        
        const stipendNum = parseInt(stipend.replace(/[^0-9]/g, ''));
        if (!isNaN(stipendNum)) {
            return `₹${stipendNum.toLocaleString()}/month`;
        }
        return stipend;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
            <LandingHeader isAuthenticated={isAuthenticated} />

            <main className="pt-24 pb-20 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Navigation with breadcrumb */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between mb-8"
                    >
                        <button
                            onClick={() => router.back()}
                            className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-[#5693C1] hover:text-[#5693C1] transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium">Back</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <nav className="flex items-center gap-2 text-sm text-gray-500">
                                <Link href="/" className="hover:text-[#5693C1] transition-colors">Home</Link>
                                <ChevronRight className="w-3 h-3" />
                                <Link href="/internships" className="hover:text-[#5693C1] transition-colors">Internships</Link>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-gray-900 font-medium truncate max-w-[200px]">{internship.title}</span>
                            </nav>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content - Left Column */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-2 space-y-6"
                        >
                            {/* Main Info Card */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                                {/* Header with gradient */}
                                <div className="relative h-32 bg-gradient-to-r from-[#5693C1] to-[#3a6a8c]">
                                    <div className="absolute inset-0 opacity-10" style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20 L40 20 L20 40 Z' fill='white' fill-opacity='0.1'/%3E%3C/svg%3E")`
                                    }} />
                                    
                                    {/* Company logo */}
                                    <div className="absolute -bottom-12 left-8">
                                        <div className="w-24 h-24 bg-white rounded-xl border-4 border-white shadow-xl flex items-center justify-center">
                                            <Building2 className="w-12 h-12 text-[#5693C1]" />
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="absolute top-4 right-4 flex items-center gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setIsSaved(!isSaved)}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-lg"
                                        >
                                            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-[#5693C1] text-[#5693C1]' : 'text-gray-600'}`} />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-lg"
                                        >
                                            <Share2 className="w-5 h-5 text-gray-600" />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="pt-16 p-8">
                                    {/* Title and badges */}
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                        <div>
                                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                                {internship.title}
                                            </h1>
                                            <p className="text-lg text-gray-500">{internship.company}</p>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            {internship.source === 'internal' && (
                                                <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full border border-emerald-200">
                                                    <Shield className="w-4 h-4" />
                                                    Verified
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 px-3 py-1 bg-[#5693C1]/10 text-[#5693C1] text-sm font-medium rounded-full border border-[#5693C1]/20">
                                                <Zap className="w-4 h-4" />
                                                Active
                                            </span>
                                        </div>
                                    </div>

                                    {/* Key metrics grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <MapPin className="w-5 h-5 text-[#5693C1] mb-2" />
                                            <div className="text-sm text-gray-500">Location</div>
                                            <div className="font-semibold text-gray-900">
                                                {internship.remote ? 'Remote' : (internship.location || 'India')}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <Calendar className="w-5 h-5 text-[#5693C1] mb-2" />
                                            <div className="text-sm text-gray-500">Duration</div>
                                            <div className="font-semibold text-gray-900">{internship.duration || '3-6 Months'}</div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <Briefcase className="w-5 h-5 text-[#5693C1] mb-2" />
                                            <div className="text-sm text-gray-500">Type</div>
                                            <div className="font-semibold text-gray-900">Internship</div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <Clock className="w-5 h-5 text-[#5693C1] mb-2" />
                                            <div className="text-sm text-gray-500">Posted</div>
                                            <div className="font-semibold text-gray-900">{formatDate(internship.postedAt)}</div>
                                        </div>
                                    </div>

                                    {/* Tabs */}
                                    <div className="border-b border-gray-200 mb-6">
                                        <div className="flex gap-6">
                                            {(['overview', 'requirements', 'about'] as const).map((tab) => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveTab(tab)}
                                                    className={`pb-3 text-sm font-medium capitalize transition-all relative ${
                                                        activeTab === tab
                                                            ? 'text-[#5693C1]'
                                                            : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                                >
                                                    {tab}
                                                    {activeTab === tab && (
                                                        <motion.div
                                                            layoutId="activeTab"
                                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5693C1] rounded-full"
                                                        />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tab content */}
                                    <div className="min-h-[300px]">
                                        {activeTab === 'overview' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-6"
                                            >
                                                <div className="prose prose-gray max-w-none">
                                                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                        {internship.description}
                                                    </p>
                                                </div>

                                                {/* Stipend highlight */}
                                                <div className="bg-gradient-to-r from-[#5693C1]/5 to-[#3a6a8c]/5 rounded-xl p-6 border border-[#5693C1]/10">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <DollarSign className="w-6 h-6 text-[#5693C1]" />
                                                        <h3 className="text-lg font-semibold text-gray-900">Financial Support</h3>
                                                    </div>
                                                    <p className="text-2xl font-bold text-gray-900 mb-2">
                                                        {formatStipend(internship.stipend)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        *As per company disclosure at the time of aggregation
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}

                                        {activeTab === 'requirements' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-4"
                                            >
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Award className="w-5 h-5 text-[#5693C1]" />
                                                    <h3 className="font-semibold text-gray-900">Skills & Qualifications</h3>
                                                </div>
                                                <ul className="space-y-3">
                                                    {internship.skills?.map((skill, idx) => (
                                                        <li key={idx} className="flex items-start gap-3">
                                                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                                            <span className="text-gray-600">{skill}</span>
                                                        </li>
                                                    )) || (
                                                        <li className="text-gray-500">No specific requirements listed</li>
                                                    )}
                                                </ul>
                                            </motion.div>
                                        )}

                                        {activeTab === 'about' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-6"
                                            >
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-3">About {internship.company}</h3>
                                                    <p className="text-gray-600">
                                                        {internship.companyDescription || 'No company description available.'}
                                                    </p>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-gray-50 rounded-xl">
                                                        <Globe className="w-5 h-5 text-[#5693C1] mb-2" />
                                                        <div className="text-sm text-gray-500">Industry</div>
                                                        <div className="font-medium text-gray-900">Technology</div>
                                                    </div>
                                                    <div className="p-4 bg-gray-50 rounded-xl">
                                                        <Users className="w-5 h-5 text-[#5693C1] mb-2" />
                                                        <div className="text-sm text-gray-500">Company Size</div>
                                                        <div className="font-medium text-gray-900">50-200 employees</div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Sidebar - Right Column */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-1 space-y-6"
                        >
                            {/* Apply Card */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden sticky top-24">
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Apply for this Position</h3>
                                    
                                    {/* Application stats */}
                                    <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                                        <Users className="w-8 h-8 text-[#5693C1]" />
                                        <div>
                                            <div className="text-sm text-gray-500">Active Applicants</div>
                                            <div className="text-2xl font-bold text-gray-900">24</div>
                                        </div>
                                    </div>

                                    {/* Notice */}
                                    <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
                                        <div className="flex gap-3">
                                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                                            <p className="text-xs text-amber-700 leading-relaxed">
                                                <strong className="block mb-1">Redirect Notice</strong>
                                                Applications are handled on the employer's official website. You will be redirected.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Apply button */}
                                    <a
                                        href={internship.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative overflow-hidden w-full inline-flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 mb-4"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            Apply Now
                                            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </span>
                                        <motion.div
                                            className="absolute inset-0 bg-white"
                                            initial={{ x: '-100%' }}
                                            whileHover={{ x: '100%' }}
                                            transition={{ duration: 0.5 }}
                                            style={{ opacity: 0.2 }}
                                        />
                                    </a>

                                    {/* Deadline info */}
                                    {internship.deadline && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-gray-500">Application Deadline</span>
                                                <span className="font-semibold text-[#5693C1]">
                                                    {new Date(internship.deadline).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '60%' }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    className="h-full bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] rounded-full"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-400 text-center">
                                        Aggregated from {internship.source} • Updated {formatDate(internship.postedAt)}
                                    </p>
                                </div>
                            </div>

                            {/* Readiness Card */}
                            <div className="bg-gradient-to-br from-[#5693C1] to-[#3a6a8c] rounded-2xl p-6 text-white shadow-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <Target className="w-5 h-5" />
                                    <h4 className="font-semibold">Readiness Check</h4>
                                </div>
                                <p className="text-sm text-white/90 mb-4">
                                    See how your skills match this internship's requirements
                                </p>
                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Your match score</span>
                                        <span className="font-bold">78%</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '78%' }}
                                            transition={{ duration: 1, delay: 0.3 }}
                                            className="h-full bg-white rounded-full"
                                        />
                                    </div>
                                </div>
                                <button className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm border border-white/10">
                                    Check Your Readiness
                                </button>
                            </div>

                            {/* Similar Internships Preview */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h4 className="font-semibold text-gray-900 mb-4">Similar Opportunities</h4>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <Link
                                            key={i}
                                            href="#"
                                            className="block p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <Building2 className="w-8 h-8 text-gray-400" />
                                                <div>
                                                    <div className="font-medium text-gray-900 group-hover:text-[#5693C1] transition-colors">
                                                        Frontend Developer
                                                    </div>
                                                    <div className="text-xs text-gray-500">Tech Corp • Remote</div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}