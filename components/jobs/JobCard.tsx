import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    MapPin,
    Briefcase,
    Clock,
    Building2,
    ArrowRight,
    DollarSign,
    Users,
    TrendingUp,
    Sparkles,
    Bookmark,
    Share2,
    Shield,
    Calendar,
    Award,
    Zap,
    CheckCircle2,
    ExternalLink
} from 'lucide-react';
import { JobDTO } from '@/types/jobs';
import React, { useState } from 'react';

interface JobCardProps {
    job: JobDTO;
    index?: number;
}

// Helper function to format salary
const formatSalary = (salary?: string | null): string => {
    if (!salary) return 'Competitive Salary';
    if (salary.toLowerCase().includes('competitive')) return salary;

    // Check if it's a number string
    const salaryNum = parseInt(salary.replace(/[^0-9]/g, ''));
    if (!isNaN(salaryNum)) {
        return `₹${salaryNum.toLocaleString()}/year`;
    }

    return salary;
};

// Helper to determine if job is new (posted within last 7 days)
const isWithinLast7Days = (dateString?: string | Date): boolean => {
    if (!dateString) return false;
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays < 7;
    } catch {
        return false;
    }
};

// Get experience level badge color
const getExperienceColor = (level?: string): string => {
    if (!level) return 'bg-gray-100 text-gray-600';

    const levelLower = level.toLowerCase();
    if (levelLower.includes('entry') || levelLower.includes('fresher')) {
        return 'bg-green-100 text-green-700 border-green-200';
    }
    if (levelLower.includes('mid') || levelLower.includes('intermediate')) {
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    if (levelLower.includes('senior') || levelLower.includes('advanced')) {
        return 'bg-purple-100 text-purple-700 border-purple-200';
    }
    if (levelLower.includes('lead') || levelLower.includes('manager')) {
        return 'bg-orange-100 text-orange-700 border-orange-200';
    }
    return 'bg-gray-100 text-gray-600';
};

export default function JobCard({ job, index = 0 }: JobCardProps) {
    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const isNew = isWithinLast7Days(job.postedAt);

    const formattedDate = job.postedAt
        ? new Date(job.postedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
        : 'Recently';

    const handleSaveToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsSaved(!isSaved);
    };

    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Implement share functionality
        console.log('Share job:', job.id);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative h-full"
        >
            {/* Animated gradient border */}
            <motion.div
                animate={{
                    opacity: isHovered ? 0.5 : 0,
                    scale: isHovered ? 1.02 : 1,
                }}
                className="absolute -inset-0.5 bg-gradient-to-r from-[#5693C1] via-[#3a6a8c] to-[#5693C1] rounded-2xl blur-md transition-opacity duration-500"
            />

            {/* Main card */}
            <div className={`relative bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden h-full flex flex-col ${isHovered
                    ? 'border-transparent shadow-2xl'
                    : 'border-gray-100 shadow-lg hover:shadow-xl'
                }`}>
                {/* Card header with gradient */}
                <div className="relative h-20 bg-gradient-to-r from-[#5693C1]/10 to-[#3a6a8c]/10 border-b border-gray-100">
                    {/* Decorative pattern */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20 L40 20 L20 40 Z' fill='%235693C1' fill-opacity='0.1'/%3E%3C/svg%3E")`
                    }} />

                    {/* Status badges */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">

                        {/* Verified badge */}
                        {job.source === 'internal' && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                                <Shield className="w-3 h-3" />
                                Verified
                            </div>
                        )}
                    </div>

                    {/* Company logo placeholder */}
                    <div className="absolute -bottom-8 left-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#5693C1] to-[#3a6a8c] rounded-xl border-4 border-white shadow-lg flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>

                {/* Card content */}
                <div className="pt-10 p-6 flex-1 flex flex-col">
                    {/* Title and company */}
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#5693C1] transition-colors line-clamp-2 mb-2">
                            {job.title || 'Untitled Position'}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {job.company || 'Company Name'}
                        </p>
                    </div>

                    {/* Key metrics grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <MapPin className="w-4 h-4 text-[#5693C1]" />
                            <span className="text-xs font-medium truncate">
                                {job.location || 'Remote'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Briefcase className="w-4 h-4 text-[#5693C1]" />
                            <span className="text-xs font-medium">{job.employmentType || 'Full-time'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Users className="w-4 h-4 text-[#5693C1]" />
                            <span className="text-xs font-medium">Active hiring</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-[#5693C1]" />
                            <span className="text-xs font-medium">High demand</span>
                        </div>
                    </div>

                    {/* Salary section */}
                    {job.salary && (
                        <motion.div
                            animate={{ scale: isHovered ? 1.02 : 1 }}
                            className="flex items-center justify-between bg-gradient-to-r from-[#5693C1]/10 to-[#3a6a8c]/10 px-4 py-3 rounded-xl border border-[#5693C1]/20 mb-4"
                        >
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-[#5693C1]" />
                                <span className="font-bold text-gray-900">
                                    {formatSalary(job.salary)}
                                </span>
                            </div>
                            {job.salary && /\d/.test(job.salary) && (
                                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                    Annual
                                </span>
                            )}
                        </motion.div>
                    )}

                    {/* Experience level badge */}
                    {job.experienceLevel && (
                        <div className="mb-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border ${getExperienceColor(job.experienceLevel)}`}>
                                <Award className="w-3 h-3" />
                                {job.experienceLevel}
                            </span>
                        </div>
                    )}

                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                        {job.description?.replace(/<[^>]*>?/gm, '') || 'No description provided.'}
                    </p>

                    {/* Skills/Tags */}
                    {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {job.skills.slice(0, 3).map((skill, idx) => (
                                <span
                                    key={`${skill}-${idx}`}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200"
                                >
                                    {skill}
                                </span>
                            ))}
                            {job.skills.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200">
                                    +{job.skills.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-xs text-gray-400">
                                    Posted {formattedDate}
                                </span>
                            </div>

                            {job.applicants && job.applicants > 0 && (
                                <div className="flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs text-gray-400">
                                        {job.applicants}+ applied
                                    </span>
                                </div>
                            )}
                        </div>

                        <Link
                            href={`/jobs/${job.id}`}
                            className="group/link relative overflow-hidden w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                View Details
                                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                            </span>
                            <motion.div
                                className="absolute inset-0 bg-white"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.5 }}
                                style={{ opacity: 0.2 }}
                            />
                        </Link>

                        {/* Application deadline if exists */}
                        {job.deadline && (
                            <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-gray-500">Application deadline</span>
                                    <span className="text-[#5693C1] font-medium">
                                        {new Date(job.deadline).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
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
                </div>

                {/* Bottom accent line */}
                <motion.div
                    animate={{ width: isHovered ? '100%' : '0%' }}
                    className="h-1 bg-gradient-to-r from-[#5693C1] to-[#3a6a8c]"
                />
            </div>
        </motion.div>
    );
}