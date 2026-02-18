'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Target,
    BarChart3,
    CheckCircle2,
    AlertCircle,
    Clock,
    Users,
    BookOpen,
    Award,
    TrendingUp,
    Shield,
    Zap,
    Sparkles,
    Download,
    RefreshCw,
    ChevronRight,
    Home,
    Settings,
    UserCheck,
    FileText,
    Star,
    Timer,
    Briefcase,
    GraduationCap,
    AlertTriangle,
    Info,
    XCircle,
    CheckCircle,
    Loader2,
    ArrowLeft,
    ArrowRight
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface Context {
    has_target_role: boolean;
    role?: {
        id: string;
        name: string;
    };
    required_skills_count: number;
    total_benchmark_skills_count: number;
    user_skills_count: number;
    user_skills_by_source?: {
        self: number;
        resume: number;
        validated: number;
    };
    validation?: {
        validated_count: number;
        rejected_count: number;
        has_updates_since_last_calc: boolean;
    };
    last_calculated_at: string | null;
    edge_case?: string;
    edge_case_message?: string;
    action_url?: string;
}

interface ReadinessScore {
    readiness_id?: string;
    percentage: number;
    total_score: number;
    max_possible_score: number;
    calculated_at: string;
    skill_stats?: {
        skills_met: number;
        skills_missing: number;
    };
    missing_required_skills?: string[];
}

interface CalculationResult extends ReadinessScore {
    _type: 'success' | 'cooldown' | 'no_changes' | 'edge_case';
    _fromResumeSync?: boolean;
    _fromValidation?: boolean;
    message?: string;
    recalculated?: boolean;
    edge_case?: string;
    roadmap_updated?: boolean;
}

interface SkillBreakdown {
    breakdown: unknown[];
    required_skills: {
        total: number;
        met: number;
        missing: number;
        met_skills: Array<{ name: string; source: string } | string>;
        missing_skills: string[];
    };
    optional_skills: {
        total: number;
        met: number;
        missing: number;
        met_skills: Array<{ name: string; source: string } | string>;
        missing_skills: string[];
    };
    weight_impact?: {
        achieved_weight: number;
        total_weight: number;
        required_weight_achieved: number;
        required_weight_total: number;
    };
    trust_indicators?: {
        validated_count: number;
    };
}

interface ReadinessPageClientProps {
    userId: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const getReadinessStatus = (percentage: number) => {
    if (percentage >= 70) {
        return { 
            label: 'Ready', 
            color: 'success', 
            icon: CheckCircle2,
            bgColor: 'bg-green-50',
            textColor: 'text-green-700',
            borderColor: 'border-green-200',
            iconColor: 'text-green-600'
        };
    } else if (percentage >= 40) {
        return { 
            label: 'Partially Ready', 
            color: 'warning', 
            icon: AlertTriangle,
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-700',
            borderColor: 'border-amber-200',
            iconColor: 'text-amber-600'
        };
    } else {
        return { 
            label: 'Not Ready', 
            color: 'danger', 
            icon: XCircle,
            bgColor: 'bg-red-50',
            textColor: 'text-red-700',
            borderColor: 'border-red-200',
            iconColor: 'text-red-600'
        };
    }
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// ============================================================================
// Loading Skeleton
// ============================================================================

const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4">
            <div className="animate-pulse">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="h-8 bg-gray-200 rounded-full w-64 mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-96 mx-auto"></div>
                </div>
                
                {/* Context Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>
                        ))}
                    </div>
                </div>
                
                {/* Score Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                    <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
                    <div className="flex justify-center py-12">
                        <div className="w-36 h-36 bg-gray-200 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// ============================================================================
// Stat Card Component
// ============================================================================

interface StatCardProps {
    icon: React.ElementType;
    title: string;
    value: string | number;
    subtitle?: string;
    color: 'blue' | 'amber' | 'green' | 'gray' | 'purple' | 'emerald';
    trend?: {
        value: number;
        label: string;
    };
}

const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }: StatCardProps) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        gray: 'bg-gray-50 text-gray-600 border-gray-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    };

    return (
        <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-xs">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-600 font-medium">{trend.value}%</span>
                        <span className="text-gray-400">{trend.label}</span>
                    </div>
                )}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
            <div className="text-sm text-gray-500">{title}</div>
            {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
        </div>
    );
};

// ============================================================================
// Skill Badge Component
// ============================================================================

interface SkillBadgeProps {
    name: string;
    source?: 'validated' | 'resume' | 'self' | null;
    status: 'met' | 'missing' | 'optional';
}

const SkillBadge = ({ name, source, status }: SkillBadgeProps) => {
    const sourceConfig = {
        validated: { icon: Award, label: 'Validated', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        resume: { icon: FileText, label: 'From Resume', color: 'text-blue-600', bg: 'bg-blue-50' },
        self: { icon: UserCheck, label: 'Self-Declared', color: 'text-gray-600', bg: 'bg-gray-50' },
    };

    const statusConfig = {
        met: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: CheckCircle },
        missing: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: XCircle },
        optional: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', icon: AlertCircle },
    };

    const config = statusConfig[status];
    const StatusIcon = config.icon;
    const SourceIcon = source ? sourceConfig[source].icon : null;

    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${config.bg} ${config.text} border ${config.border} transition-all hover:shadow-md`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{name}</span>
            {source && SourceIcon && (
                <SourceIcon className={`w-3.5 h-3.5 ml-1 ${sourceConfig[source].color}`} />
            )}
        </div>
    );
};

// ============================================================================
// Main Component
// ============================================================================

export default function ReadinessPageClient({ userId }: ReadinessPageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // State
    const [context, setContext] = useState<Context | null>(null);
    const [isLoadingContext, setIsLoadingContext] = useState(true);
    const [contextError, setContextError] = useState<string | null>(null);
    
    const [latestReadiness, setLatestReadiness] = useState<ReadinessScore | null>(null);
    const [isLoadingLatest, setIsLoadingLatest] = useState(true);
    
    const [isCalculating, setIsCalculating] = useState(false);
    const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
    
    const [skillBreakdown, setSkillBreakdown] = useState<SkillBreakdown | null>(null);
    const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(false);
    
    const [isFromResumeSync, setIsFromResumeSync] = useState(false);
    const hasTriggeredRecalculate = useRef(false);

    // Check for recalculate query param (from resume sync)
    useEffect(() => {
        if (searchParams.get('recalculate') === 'true' && !hasTriggeredRecalculate.current) {
            setIsFromResumeSync(true);
        }
    }, [searchParams]);

    // Fetch context data
    const fetchContext = useCallback(async () => {
        try {
            setIsLoadingContext(true);
            const response = await fetch(`/api/readiness/context`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch context');
            }
            
            setContext(data.data || data);
        } catch (error) {
            console.error('[ReadinessPage] Error fetching context:', error);
            setContextError(error instanceof Error ? error.message : 'Failed to load context');
        } finally {
            setIsLoadingContext(false);
        }
    }, []);

    // Fetch latest readiness
    const fetchLatestReadiness = useCallback(async () => {
        if (!context?.has_target_role || !context?.role?.id) {
            setIsLoadingLatest(false);
            return;
        }
        
        try {
            setIsLoadingLatest(true);
            const response = await fetch(`/api/users/${userId}/readiness`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data?.snapshot) {
                    setLatestReadiness({
                        readiness_id: data.data.snapshot.id,
                        percentage: data.data.snapshot.percentage,
                        total_score: data.data.snapshot.totalScore,
                        max_possible_score: data.data.snapshot.maxPossibleScore,
                        calculated_at: data.data.snapshot.createdAt,
                        skill_stats: {
                            skills_met: data.data.snapshot.skillsMatched,
                            skills_missing: data.data.snapshot.skillsMissing,
                        },
                    });
                    
                    // Fetch breakdown if we have a snapshot
                    if (data.data.snapshot.breakdown) {
                        processBreakdown(data.data.snapshot.breakdown);
                    }
                }
            }
        } catch (error) {
            console.error('[ReadinessPage] Error fetching latest readiness:', error);
        } finally {
            setIsLoadingLatest(false);
        }
    }, [context, userId]);

    // Process breakdown data
    const processBreakdown = (breakdown: unknown[]) => {
        const breakdownArray = breakdown as Array<{
            importance: string;
            isMissing: boolean;
            skillName: string;
            source: string;
            weight: number;
        }>;
        
        const requiredSkills = breakdownArray.filter(s => s.importance === 'required');
        const optionalSkills = breakdownArray.filter(s => s.importance === 'optional');
        
        setSkillBreakdown({
            breakdown: breakdownArray,
            required_skills: {
                total: requiredSkills.length,
                met: requiredSkills.filter(s => !s.isMissing).length,
                missing: requiredSkills.filter(s => s.isMissing).length,
                met_skills: requiredSkills.filter(s => !s.isMissing).map(s => ({ name: s.skillName, source: s.source })),
                missing_skills: requiredSkills.filter(s => s.isMissing).map(s => s.skillName),
            },
            optional_skills: {
                total: optionalSkills.length,
                met: optionalSkills.filter(s => !s.isMissing).length,
                missing: optionalSkills.filter(s => s.isMissing).length,
                met_skills: optionalSkills.filter(s => !s.isMissing).map(s => ({ name: s.skillName, source: s.source })),
                missing_skills: optionalSkills.filter(s => s.isMissing).map(s => s.skillName),
            },
            weight_impact: {
                achieved_weight: breakdownArray.filter(s => !s.isMissing).reduce((acc, s) => acc + s.weight, 0),
                total_weight: breakdownArray.reduce((acc, s) => acc + s.weight, 0),
                required_weight_achieved: requiredSkills.filter(s => !s.isMissing).reduce((acc, s) => acc + s.weight, 0),
                required_weight_total: requiredSkills.reduce((acc, s) => acc + s.weight, 0),
            },
            trust_indicators: {
                validated_count: breakdownArray.filter(s => s.source === 'validated').length,
            },
        });
    };

    // Handle calculate readiness
    const handleCalculateReadiness = async (force: boolean = false) => {
        setIsCalculating(true);
        setCalculationResult(null);
        
        try {
            const response = await fetch(`/api/users/${userId}/readiness`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ force }),
            });
            
            const result = await response.json();
            
            if (response.status === 429) {
                setCalculationResult({
                    ...result,
                    _type: 'cooldown',
                    percentage: latestReadiness?.percentage || 0,
                    total_score: latestReadiness?.total_score || 0,
                    max_possible_score: latestReadiness?.max_possible_score || 0,
                    calculated_at: latestReadiness?.calculated_at || '',
                });
                return;
            }
            
            if (result.recalculated === false) {
                setCalculationResult({
                    ...result,
                    _type: 'no_changes',
                    percentage: latestReadiness?.percentage || 0,
                    total_score: latestReadiness?.total_score || 0,
                    max_possible_score: latestReadiness?.max_possible_score || 0,
                    calculated_at: latestReadiness?.calculated_at || '',
                });
                return;
            }
            
            if (!response.ok) {
                throw new Error(result.message || 'Calculation failed');
            }
            
            // Success
            const snapshot = result.data?.snapshot || result.snapshot;
            setCalculationResult({
                _type: 'success',
                _fromResumeSync: isFromResumeSync,
                readiness_id: snapshot?.id,
                percentage: snapshot?.percentage || 0,
                total_score: snapshot?.totalScore || 0,
                max_possible_score: snapshot?.maxPossibleScore || 0,
                calculated_at: snapshot?.createdAt || new Date().toISOString(),
                skill_stats: {
                    skills_met: snapshot?.skillsMatched || 0,
                    skills_missing: snapshot?.skillsMissing || 0,
                },
                roadmap_updated: result.roadmap_updated,
            });
            
            // Process breakdown
            if (snapshot?.breakdown) {
                processBreakdown(snapshot.breakdown);
            }
            
            // Refresh context
            fetchContext();
            
            if (isFromResumeSync) {
                setIsFromResumeSync(false);
            }
            
        } catch (error) {
            console.error('[ReadinessPage] Calculation failed:', error);
        } finally {
            setIsCalculating(false);
        }
    };

    // Auto-trigger recalculation for resume sync
    useEffect(() => {
        if (
            isFromResumeSync && 
            context?.has_target_role && 
            !isLoadingContext && 
            !hasTriggeredRecalculate.current
        ) {
            hasTriggeredRecalculate.current = true;
            handleCalculateReadiness(true);
        }
    }, [isFromResumeSync, context, isLoadingContext]);

    // Initial data fetch
    useEffect(() => {
        fetchContext();
    }, [fetchContext]);

    useEffect(() => {
        if (context?.has_target_role) {
            fetchLatestReadiness();
        }
    }, [context, fetchLatestReadiness]);

    // ============================================================================
    // Render: Loading State
    // ============================================================================
    if (isLoadingContext) {
        return <LoadingSkeleton />;
    }

    // ============================================================================
    // Render: Error State
    // ============================================================================
    if (contextError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-2xl p-12 shadow-sm text-center border border-gray-100">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Readiness</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">{contextError}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-8 py-3 bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================================
    // Render: No Target Role State
    // ============================================================================
    if (!context?.has_target_role || context?.edge_case === 'NO_TARGET_ROLE') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
                            <Target className="w-8 h-8 text-[#5693C1]" />
                            Readiness Evaluation
                        </h1>
                    </div>
                    
                    {/* No Role Card */}
                    <div className="bg-white rounded-2xl p-12 shadow-sm text-center border border-gray-100">
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Target className="w-10 h-10 text-amber-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">No Target Role Selected</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            {context?.edge_case_message || 'Please select a target role before calculating readiness.'}
                            <br />
                            <span className="text-sm text-gray-500 mt-2 block">
                                Your readiness score is evaluated against the skills required for your target role.
                            </span>
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={context?.action_url || '/dashboard/roles'}
                                className="px-8 py-3 bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:-translate-y-1 inline-flex items-center gap-2"
                            >
                                <Target className="w-4 h-4" />
                                Select Target Role
                            </Link>
                            <Link
                                href="/dashboard"
                                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300 inline-flex items-center gap-2"
                            >
                                <Home className="w-4 h-4" />
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================================
    // Render: No User Skills State
    // ============================================================================
    if (context?.edge_case === 'NO_USER_SKILLS') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
                            <Target className="w-8 h-8 text-[#5693C1]" />
                            Readiness Evaluation
                        </h1>
                        <p className="text-gray-600 mt-2 text-lg">
                            Evaluate your skills against industry benchmarks for your target role
                        </p>
                    </div>
                    
                    {/* Context Section */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-[#5693C1]" />
                            Evaluation Context
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm text-blue-600 font-medium">Target Role</div>
                                    <div className="font-bold text-gray-900 text-lg">{context.role?.name || 'Unknown'}</div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-5 flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
                                    <Star className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm text-amber-600 font-medium">Required Skills</div>
                                    <div className="font-bold text-gray-900 text-lg">
                                        {context.required_skills_count} of {context.total_benchmark_skills_count}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* No Skills Guidance */}
                    <div className="bg-white rounded-2xl p-12 shadow-sm text-center border border-gray-100">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-10 h-10 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Add Your Skills to Get Started</h2>
                        <p className="text-gray-600 mb-8 max-w-lg mx-auto">{context.edge_case_message}</p>
                        
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 text-left mb-8 max-w-md mx-auto border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-[#5693C1]" />
                                How to add your skills:
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <UserCheck className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="text-gray-700"><span className="font-medium">Self-Add:</span> Manually select skills you possess</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="text-gray-700"><span className="font-medium">Resume Upload:</span> Upload your resume for auto-extraction</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Award className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <span className="text-gray-700"><span className="font-medium">Get Validated:</span> Complete assessments to validate skills</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={context?.action_url || '/dashboard/skills'}
                                className="px-8 py-3 bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:-translate-y-1 inline-flex items-center gap-2"
                            >
                                <BookOpen className="w-4 h-4" />
                                Add Your Skills
                            </Link>
                            <Link
                                href="/dashboard"
                                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300 inline-flex items-center gap-2"
                            >
                                <Home className="w-4 h-4" />
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================================
    // Render: Main Page
    // ============================================================================
    const currentScore = calculationResult || latestReadiness;
    const hasScore = currentScore && currentScore.percentage !== undefined;
    const percentage = hasScore ? currentScore.percentage : 0;
    const status = getReadinessStatus(percentage);
    const StatusIcon = status.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#5693C1]/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#3a6a8c]/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-4xl mx-auto px-4 relative z-10">
                {/* Header with breadcrumb */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Link href="/dashboard" className="hover:text-[#5693C1] transition-colors">Dashboard</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 font-medium">Readiness</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] rounded-xl flex items-center justify-center">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            Readiness Evaluation
                        </h1>
                        
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor} border ${status.borderColor} flex items-center gap-1.5`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {status.label}
                            </span>
                        </div>
                    </div>
                    
                    <p className="text-gray-600 mt-2 ml-14">
                        Evaluate your skills against industry benchmarks for <span className="font-semibold text-[#5693C1]">{context?.role?.name}</span>
                    </p>
                </div>

                {/* Section A: Context */}
                <section className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-gray-100">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Info className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            Evaluation Context
                        </h2>
                        <p className="text-sm text-gray-500 ml-8">What's being evaluated in your readiness calculation</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={Target}
                            title="Target Role"
                            value={context?.role?.name || 'Unknown'}
                            color="blue"
                        />
                        
                        <StatCard
                            icon={Star}
                            title="Required Skills"
                            value={context?.required_skills_count || 0}
                            subtitle={`of ${context?.total_benchmark_skills_count} total`}
                            color="amber"
                        />
                        
                        <StatCard
                            icon={UserCheck}
                            title="Your Skills"
                            value={context?.user_skills_count || 0}
                            subtitle={context?.user_skills_count === 0 ? 'No skills added' : undefined}
                            color="green"
                            trend={context?.user_skills_count ? { value: 100, label: 'complete' } : undefined}
                        />
                        
                        <StatCard
                            icon={Clock}
                            title="Last Calculated"
                            value={context?.last_calculated_at ? formatDate(context.last_calculated_at)?.split(',')[0] || 'Never' : 'Never'}
                            subtitle={context?.last_calculated_at ? formatDate(context.last_calculated_at)?.split(',')[1] : undefined}
                            color="gray"
                        />
                    </div>
                    
                    {/* First-time user message */}
                    {!context?.last_calculated_at && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl flex items-start gap-3 border border-blue-100">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-800">
                                    <span className="font-semibold">First time here?</span> Click "Calculate Readiness" below to get your first readiness score. 
                                    The calculation will evaluate your skills against the <span className="font-medium">{context?.total_benchmark_skills_count}</span> benchmark skills for{' '}
                                    <span className="font-medium">{context?.role?.name}</span>.
                                </p>
                            </div>
                        </div>
                    )}
                    
                    {/* Skill source badges */}
                    {context?.user_skills_count && context.user_skills_count > 0 && context?.user_skills_by_source && (
                        <div className="mt-4 flex items-center gap-3">
                            <span className="text-xs text-gray-500">Skill sources:</span>
                            {context.user_skills_by_source.self > 0 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs flex items-center gap-1">
                                    <UserCheck className="w-3 h-3" />
                                    {context.user_skills_by_source.self} self
                                </span>
                            )}
                            {context.user_skills_by_source.resume > 0 && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {context.user_skills_by_source.resume} resume
                                </span>
                            )}
                            {context.user_skills_by_source.validated > 0 && (
                                <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs flex items-center gap-1">
                                    <Award className="w-3 h-3" />
                                    {context.user_skills_by_source.validated} validated
                                </span>
                            )}
                        </div>
                    )}
                </section>

                {/* Section B: Readiness Score */}
                <section className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-gray-100">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                            </div>
                            Readiness Score
                        </h2>
                        <p className="text-sm text-gray-500 ml-8">Your current readiness evaluation for {context?.role?.name}</p>
                    </div>
                    
                    {isLoadingLatest ? (
                        <div className="flex flex-col items-center py-12">
                            <Loader2 className="w-8 h-8 text-[#5693C1] animate-spin mb-3" />
                            <p className="text-gray-500">Loading your readiness score...</p>
                        </div>
                    ) : !hasScore ? (
                        /* No Score Yet */
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BarChart3 className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Readiness Score Yet</h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                Calculate your readiness to see how prepared you are for{' '}
                                <strong className="text-[#5693C1]">{context?.role?.name}</strong>.
                                {context?.user_skills_count === 0 && (
                                    <span className="block mt-2 text-amber-600 bg-amber-50 p-2 rounded-lg">
                                        ⚠️ You haven't added any skills yet. Your score will be 0%.
                                    </span>
                                )}
                            </p>
                            <button 
                                onClick={() => handleCalculateReadiness(false)}
                                disabled={isCalculating}
                                className="px-8 py-3 bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 inline-flex items-center gap-2"
                            >
                                {isCalculating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Calculating...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4" />
                                        Calculate My Readiness
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        /* Has Score */
                        <div>
                            {/* Main Score Display */}
                            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                                {/* Score Circle */}
                                <div className="relative">
                                    <svg className="w-36 h-36 transform -rotate-90">
                                        <circle
                                            className="text-gray-200"
                                            strokeWidth="8"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="64"
                                            cx="72"
                                            cy="72"
                                        />
                                        <circle
                                            className={`${status.color === 'success' ? 'text-green-500' : status.color === 'warning' ? 'text-amber-500' : 'text-red-500'}`}
                                            strokeWidth="8"
                                            strokeDasharray={402}
                                            strokeDashoffset={402 - (402 * percentage) / 100}
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="64"
                                            cx="72"
                                            cy="72"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-gray-900">{percentage}%</span>
                                        <span className="text-xs text-gray-500">Readiness</span>
                                    </div>
                                </div>
                                
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 flex-1">
                                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-gray-900">{currentScore.total_score}</div>
                                        <div className="text-xs text-gray-500">Score Points</div>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-gray-900">{currentScore.max_possible_score || '-'}</div>
                                        <div className="text-xs text-gray-500">Max Possible</div>
                                    </div>
                                    <div className="bg-green-50 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-green-600">{currentScore.skill_stats?.skills_met || '-'}</div>
                                        <div className="text-xs text-green-600">Skills Met</div>
                                    </div>
                                    <div className="bg-amber-50 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-amber-600">{currentScore.skill_stats?.skills_missing || '-'}</div>
                                        <div className="text-xs text-amber-600">Skills Missing</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Last calculated */}
                            {currentScore.calculated_at && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg">
                                    <Clock className="w-4 h-4" />
                                    Last calculated: {formatDate(currentScore.calculated_at)}
                                </div>
                            )}
                            
                            {/* Guard Messages */}
                            {calculationResult?._type === 'cooldown' && (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4 flex items-start gap-3">
                                    <Timer className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-amber-800 block mb-1">Cooldown Active</strong>
                                        <p className="text-sm text-amber-700">{calculationResult.message}</p>
                                    </div>
                                </div>
                            )}
                            
                            {calculationResult?._type === 'no_changes' && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-4 flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-green-800 block mb-1">Already Up to Date</strong>
                                        <p className="text-sm text-green-700">{calculationResult.message}</p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Actions */}
                            <div className="flex flex-wrap gap-3">
                                <button 
                                    onClick={() => handleCalculateReadiness(false)}
                                    disabled={isCalculating}
                                    className="px-6 py-3 bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 inline-flex items-center gap-2"
                                >
                                    {isCalculating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Recalculating...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="w-4 h-4" />
                                            Recalculate Readiness
                                        </>
                                    )}
                                </button>
                                
                                <Link
                                    href="/roadmap"
                                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:-translate-y-1 inline-flex items-center gap-2"
                                >
                                    <GraduationCap className="w-4 h-4" />
                                    View Roadmap
                                </Link>
                                
                                <Link
                                    href="/report"
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:-translate-y-1 inline-flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Export Report
                                </Link>
                                
                                <Link
                                    href="/dashboard"
                                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300 inline-flex items-center gap-2"
                                >
                                    <Home className="w-4 h-4" />
                                    Dashboard
                                </Link>
                            </div>
                            
                            {/* Success hint */}
                            {calculationResult?._type === 'success' && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            {calculationResult._fromResumeSync ? (
                                                <p className="text-sm text-blue-800">
                                                    <strong>Resume skills included!</strong> Your readiness now reflects skills from your uploaded resume. 
                                                    View your <Link href="/dashboard" className="underline font-medium">Dashboard</Link> for history and trends.
                                                </p>
                                            ) : (
                                                <p className="text-sm text-blue-800">
                                                    <strong>Score updated!</strong> View your <Link href="/dashboard" className="underline font-medium">Dashboard</Link> for history and trends.
                                                    {calculationResult.roadmap_updated && (
                                                        <span className="block mt-1">Your roadmap has been updated with new recommendations.</span>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* Section C: Skill Breakdown */}
                {hasScore && skillBreakdown && (
                    <section className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-gray-100">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                                Skill Breakdown
                            </h2>
                            <p className="text-sm text-gray-500 ml-8">Your skills evaluated against {context?.role?.name} requirements</p>
                        </div>
                        
                        {isLoadingBreakdown ? (
                            <div className="flex flex-col items-center py-8">
                                <Loader2 className="w-8 h-8 text-[#5693C1] animate-spin mb-3" />
                                <p className="text-gray-500">Loading skill breakdown...</p>
                            </div>
                        ) : (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {/* Required Skills */}
                                    <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                                                <Star className="w-4 h-4 text-white" />
                                            </div>
                                            <h3 className="font-semibold text-gray-900">Required Skills</h3>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-green-600">{skillBreakdown.required_skills.met}</div>
                                                    <div className="text-xs text-gray-500">Met</div>
                                                </div>
                                                <div className="text-gray-300 text-xl font-light">/</div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-red-600">{skillBreakdown.required_skills.missing}</div>
                                                    <div className="text-xs text-gray-500">Missing</div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                of {skillBreakdown.required_skills.total} total
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Optional Skills */}
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                                                <BookOpen className="w-4 h-4 text-white" />
                                            </div>
                                            <h3 className="font-semibold text-gray-900">Optional Skills</h3>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-green-600">{skillBreakdown.optional_skills.met}</div>
                                                    <div className="text-xs text-gray-500">Met</div>
                                                </div>
                                                <div className="text-gray-300 text-xl font-light">/</div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-gray-400">{skillBreakdown.optional_skills.missing}</div>
                                                    <div className="text-xs text-gray-500">Missing</div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                of {skillBreakdown.optional_skills.total} total
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Weight Impact */}
                                {skillBreakdown.weight_impact && (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 border border-blue-100">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <BarChart3 className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-1">Weight Impact</h4>
                                                <p className="text-sm text-gray-700">
                                                    You've achieved <strong>{skillBreakdown.weight_impact.achieved_weight}</strong> out of{' '}
                                                    <strong>{skillBreakdown.weight_impact.total_weight}</strong> total weight points.
                                                    {skillBreakdown.weight_impact.required_weight_total > 0 && (
                                                        <span className="block mt-1 text-blue-700">
                                                            Required skills: {skillBreakdown.weight_impact.required_weight_achieved}/{skillBreakdown.weight_impact.required_weight_total} points.
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Trust Indicators */}
                                {skillBreakdown.trust_indicators && skillBreakdown.trust_indicators.validated_count > 0 && (
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 mb-6 border border-green-200">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Award className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-semibold text-green-800 block mb-1">
                                                    {skillBreakdown.trust_indicators.validated_count} skill{skillBreakdown.trust_indicators.validated_count > 1 ? 's' : ''} mentor-validated
                                                </span>
                                                <span className="text-sm text-green-700">
                                                    Third-party verified skills receive 1.25× weight bonus
                                                </span>
                                            </div>
                                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                                <CheckCircle2 className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Source Legend */}
                                <div className="flex items-center gap-4 mb-4 text-sm">
                                    <span className="text-gray-500">Skill Sources:</span>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                                        <Award className="w-3 h-3" /> Validated
                                    </span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1">
                                        <FileText className="w-3 h-3" /> Resume
                                    </span>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs flex items-center gap-1">
                                        <UserCheck className="w-3 h-3" /> Self-declared
                                    </span>
                                </div>
                                
                                {/* Required Skills List */}
                                {skillBreakdown.required_skills.total > 0 && (
                                    <div className="mb-6">
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Star className="w-4 h-4 text-amber-600" />
                                            Required Skills ({skillBreakdown.required_skills.met}/{skillBreakdown.required_skills.total} met)
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {skillBreakdown.required_skills.met_skills.map((skill, index) => {
                                                const skillName = typeof skill === 'string' ? skill : skill.name;
                                                const skillSource = typeof skill === 'object' ? skill.source : null;
                                                return (
                                                    <SkillBadge
                                                        key={`req-met-${index}`}
                                                        name={skillName}
                                                        source={skillSource as any}
                                                        status="met"
                                                    />
                                                );
                                            })}
                                            {skillBreakdown.required_skills.missing_skills.map((skill, index) => (
                                                <SkillBadge
                                                    key={`req-miss-${index}`}
                                                    name={skill}
                                                    status="missing"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Optional Skills List */}
                                {skillBreakdown.optional_skills.total > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-gray-600" />
                                            Optional Skills ({skillBreakdown.optional_skills.met}/{skillBreakdown.optional_skills.total} met)
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {skillBreakdown.optional_skills.met_skills.map((skill, index) => {
                                                const skillName = typeof skill === 'string' ? skill : skill.name;
                                                const skillSource = typeof skill === 'object' ? skill.source : null;
                                                return (
                                                    <SkillBadge
                                                        key={`opt-met-${index}`}
                                                        name={skillName}
                                                        source={skillSource as any}
                                                        status="met"
                                                    />
                                                );
                                            })}
                                            {skillBreakdown.optional_skills.missing_skills.map((skill, index) => (
                                                <SkillBadge
                                                    key={`opt-miss-${index}`}
                                                    name={skill}
                                                    status="optional"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                    <Link
                        href="/dashboard"
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300 inline-flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <Link
                        href="/dashboard/skills"
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300 inline-flex items-center gap-2"
                    >
                        Update Skills
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}