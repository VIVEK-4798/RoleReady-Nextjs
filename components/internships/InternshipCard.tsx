import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
    MapPin, 
    Building2, 
    Calendar, 
    ArrowRight, 
    DollarSign,
    Briefcase,
    Clock,
    Users,
    Award,
    Sparkles,
    CheckCircle2,
    ExternalLink,
    Bookmark,
    Share2,
    Eye,
    TrendingUp,
    GraduationCap,
    Zap,
    Shield
} from 'lucide-react';
import { InternshipDTO } from '@/types/internships';

interface InternshipCardProps {
    internship: InternshipDTO;
    index?: number;
}

// Helper function to check if date is within last 7 days
const isWithinLast7Days = (dateString?: string | Date): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays < 7;
};

export default function InternshipCard({ internship, index = 0 }: InternshipCardProps) {
    const [isSaved, setIsSaved] = React.useState<boolean>(false);
    const [isHovered, setIsHovered] = React.useState<boolean>(false);

    // Safely format posted date
    const postedDate = React.useMemo(() => {
        if (!internship.postedAt) return 'Just now';
        try {
            return new Date(internship.postedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return 'Recently';
        }
    }, [internship.postedAt]);

    // Helper function to format stipend
    const formatStipend = (stipend?: string | null): string => {
        if (!stipend) return 'Competitive Stipend';
        if (stipend.toLowerCase().includes('competitive')) return stipend;
        if (stipend.toLowerCase().includes('paid')) return stipend;
        
        // Check if it's a number string
        const stipendNum = parseInt(stipend.replace(/[^0-9]/g, ''));
        if (!isNaN(stipendNum)) {
            return `₹${stipendNum.toLocaleString()}/month`;
        }
        
        return stipend;
    };

    // Helper to determine if internship is new
    const isNew = React.useMemo(() => 
        isWithinLast7Days(internship.postedAt), 
        [internship.postedAt]
    );

    // Helper to get experience level based on skills
    const getExperienceLevel = (): string => {
        const skills = internship.skills || [];
        
        if (skills.some(s => s.toLowerCase().includes('advanced'))) {
            return 'Advanced';
        }
        if (skills.some(s => s.toLowerCase().includes('intermediate'))) {
            return 'Intermediate';
        }
        if (skills.some(s => s.toLowerCase().includes('expert'))) {
            return 'Expert';
        }
        return 'Beginner Friendly';
    };

    // Get location display
    const getLocationDisplay = (): string => {
        if (internship.remote) return '🌍 Remote';
        if (internship.location) return `📍 ${internship.location}`;
        return '📍 India';
    };

    // Get duration display
    const getDurationDisplay = (): string => {
        if (internship.duration) return internship.duration;
        return '3-6 Months';
    };

    // Handle save toggle
    const handleSaveToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsSaved(!isSaved);
    };

    // Handle share click
    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Implement share functionality
        console.log('Share internship:', internship.id);
    };

    // Check if stipend is monthly (has a number value)
    const isMonthlyStipend = (stipend?: string | null): boolean => {
        if (!stipend) return false;
        const hasNumber = /\d/.test(stipend);
        return hasNumber && !stipend.toLowerCase().includes('competitive');
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
            <div className={`relative bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden h-full flex flex-col ${
                isHovered 
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
                        {internship.source === 'internal' && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                                <Shield className="w-3 h-3" />
                                Verified
                            </div>
                        )}
                    </div>

                    {/* Company logo placeholder */}
                    <div className="absolute -bottom-8 left-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-4 border-white shadow-lg flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Card content */}
                <div className="pt-10 p-6 flex-1 flex flex-col">
                    {/* Title and company */}
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#5693C1] transition-colors line-clamp-2 mb-1">
                            {internship.title || 'Untitled Position'}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">
                            {internship.company || 'Company Name'}
                        </p>
                    </div>

                    {/* Key metrics grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <MapPin className="w-4 h-4 text-[#5693C1]" />
                            <span className="text-xs font-medium truncate">
                                {getLocationDisplay()}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Calendar className="w-4 h-4 text-[#5693C1]" />
                            <span className="text-xs font-medium">{getDurationDisplay()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Users className="w-4 h-4 text-[#5693C1]" />
                            <span className="text-xs font-medium">Active hiring</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-[#5693C1]" />
                            <span className="text-xs font-medium">{getExperienceLevel()}</span>
                        </div>
                    </div>

                    {/* Stipend section */}
                    <motion.div 
                        animate={{ scale: isHovered ? 1.02 : 1 }}
                        className="flex items-center justify-between bg-gradient-to-r from-[#5693C1]/10 to-[#3a6a8c]/10 px-4 py-3 rounded-xl border border-[#5693C1]/20 mb-4"
                    >
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-[#5693C1]" />
                            <span className="font-bold text-gray-900">
                                {formatStipend(internship.stipend)}
                            </span>
                        </div>
                        {isMonthlyStipend(internship.stipend) && (
                            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                Monthly
                            </span>
                        )}
                    </motion.div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                        {internship.description || 'No description provided.'}
                    </p>

                    {/* Skills/Tags */}
                    {internship.skills && internship.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {internship.skills.slice(0, 3).map((skill, idx) => (
                                <span
                                    key={`${skill}-${idx}`}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200"
                                >
                                    {skill}
                                </span>
                            ))}
                            {internship.skills.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200">
                                    +{internship.skills.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-xs text-gray-400">
                                    Posted {postedDate}
                                </span>
                                {internship.applicants && internship.applicants > 0 && (
                                    <>
                                        <span className="text-gray-300">•</span>
                                        <Users className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-xs text-gray-400">
                                            {internship.applicants}+ applied
                                        </span>
                                    </>
                                )}
                            </div>

                            <Link
                                href={`/internships/${internship.id}`}
                                className="group/link flex items-center gap-2 text-[#5693C1] font-semibold text-sm hover:gap-3 transition-all"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span>View Details</span>
                                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Progress indicator (if applicable) */}
                        {internship.deadline && (
                            <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-gray-500">Application deadline</span>
                                    <span className="text-[#5693C1] font-medium">
                                        {new Date(internship.deadline).toLocaleDateString()}
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