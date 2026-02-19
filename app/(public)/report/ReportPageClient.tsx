'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
    FileText,
    Download,
    Printer,
    TrendingUp,
    TrendingDown,
    Minus,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Clock,
    Award,
    Target,
    BarChart3,
    BookOpen,
    Users,
    Sparkles,
    Shield,
    Zap,
    ChevronRight,
    Home,
    Calendar,
    ArrowLeft,
    ArrowRight,
    Loader2,
    Info,
    AlertTriangle,
    Star,
    GraduationCap,
    Briefcase,
    UserCheck,
    FileCheck,
    History,
    Layers,
    ListChecks,
    PlusCircle,
    MinusCircle,
    RefreshCw,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface SkillEntry {
    skill_id?: string;
    skill_name: string;
    source?: string;
    importance?: 'required' | 'optional';
    weight?: number;
    is_validated?: boolean;
    status?: 'met' | 'missing';
}

interface ReadinessData {
    percentage: number;
    status_label: string;
    status_color: 'danger' | 'warning' | 'success' | 'primary';
    calculated_at: string;
}

interface SkillBreakdown {
    met_count: number;
    missing_count: number;
    total_skills: number;
    met_skills: SkillEntry[];
    missing_skills: SkillEntry[];
}

interface ValidationData {
    pending_validation: number;
}

interface RoadmapData {
    by_priority?: {
        high?: number;
        medium?: number;
        low?: number;
    };
    high_priority_items?: Array<{
        skill_name: string;
        reason: string;
    }>;
}

interface HistoryEntry {
    percentage: number;
    status_label: string;
    status_color: 'danger' | 'warning' | 'success' | 'primary';
    calculated_at: string;
}

interface ReportData {
    user?: {
        name: string;
        target_role?: {
            category_name: string;
        };
    };
    readiness?: ReadinessData;
    skill_breakdown?: SkillBreakdown;
    validation?: ValidationData;
    roadmap?: RoadmapData;
    history?: HistoryEntry[];
}

interface Report {
    success: boolean;
    report: ReportData;
    generated_at: string;
    error?: string;
    message?: string;
}

interface ReportPageClientProps {
    userId: string;
    userName: string;
}

// ============================================================================
// Helper Components
// ============================================================================

interface StatusBadgeProps {
    label: string;
    color: 'danger' | 'warning' | 'success' | 'primary';
    size?: 'normal' | 'small';
    icon?: React.ElementType;
}

const StatusBadge = ({ label, color, size = 'normal', icon: Icon }: StatusBadgeProps) => {
    const colorMap = {
        danger: {
            bg: 'bg-red-50',
            text: 'text-red-700',
            border: 'border-red-200',
            icon: AlertCircle
        },
        warning: {
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            border: 'border-amber-200',
            icon: AlertTriangle
        },
        success: {
            bg: 'bg-green-50',
            text: 'text-green-700',
            border: 'border-green-200',
            icon: CheckCircle2
        },
        primary: {
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-200',
            icon: Info
        },
    };

    const config = colorMap[color];
    const BadgeIcon = Icon || config.icon;
    const sizeClass = size === 'small' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

    return (
        <span className={`inline-flex items-center gap-1.5 ${sizeClass} rounded-full font-medium border ${config.bg} ${config.text} ${config.border}`}>
            <BadgeIcon className="w-3.5 h-3.5" />
            {label}
        </span>
    );
};

interface ProgressBarProps {
    percentage: number;
    color?: 'danger' | 'warning' | 'success' | 'primary';
    height?: number;
    showLabel?: boolean;
}

const ProgressBar = ({ percentage, color = 'primary', height = 8, showLabel = false }: ProgressBarProps) => {
    const colorMap = {
        danger: 'bg-red-500',
        warning: 'bg-amber-500',
        success: 'bg-green-500',
        primary: 'bg-[#5693C1]',
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full overflow-hidden" style={{ height: `${height}px` }}>
                <div
                    className={`h-full rounded-full transition-all duration-500 ${colorMap[color]}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
            {showLabel && <span className="text-sm font-medium text-gray-700">{percentage}%</span>}
        </div>
    );
};

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray';
    trend?: {
        value: number;
        direction: 'up' | 'down' | 'stable';
    };
}

const StatCard = ({ icon: Icon, label, value, color, trend }: StatCardProps) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        red: 'bg-red-50 text-red-600 border-red-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        gray: 'bg-gray-50 text-gray-600 border-gray-100',
    };

    return (
        <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${trend.direction === 'up' ? 'text-green-600' :
                            trend.direction === 'down' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                        {trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
                        {trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
                        {trend.direction === 'stable' && <Minus className="w-3 h-3" />}
                        {trend.value}%
                    </div>
                )}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
        </div>
    );
};

interface SkillBadgeProps {
    name: string;
    source?: string;
    status: 'met' | 'missing';
    importance?: 'required' | 'optional';
    isValidated?: boolean;
}

const SkillBadge = ({ name, source, status, importance, isValidated }: SkillBadgeProps) => {
    const sourceConfig = {
        validated: { icon: Award, label: 'Validated', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        resume: { icon: FileText, label: 'From Resume', color: 'text-blue-600', bg: 'bg-blue-50' },
        self: { icon: UserCheck, label: 'Self-Declared', color: 'text-gray-600', bg: 'bg-gray-50' },
    };

    const statusConfig = {
        met: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: CheckCircle2 },
        missing: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: XCircle },
    };

    const config = statusConfig[status];
    const StatusIcon = config.icon;
    const SourceIcon = source && sourceConfig[source as keyof typeof sourceConfig]?.icon;

    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${config.bg} ${config.text} border ${config.border} transition-all hover:shadow-md`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{name}</span>
            {importance === 'required' && <Star className="w-3 h-3 text-amber-500 ml-1" />}
            {isValidated && <Award className="w-3 h-3 text-emerald-500 ml-1" />}
            {source && SourceIcon && (
                <SourceIcon className={`w-3 h-3 ml-1 ${sourceConfig[source as keyof typeof sourceConfig]?.color}`} />
            )}
        </div>
    );
};

// ============================================================================
// Main Component
// ============================================================================

export default function ReportPageClient({ userId, userName }: ReportPageClientProps) {
    const reportRef = useRef<HTMLDivElement>(null);

    // State
    const [report, setReport] = useState<Report | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<{ type: string; message: string } | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Fetch report
    const fetchReport = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/reports/${userId}`);
            const data = await response.json();

            if (data.success) {
                // Deduplicate skills
                if (data.report?.skill_breakdown) {
                    const deduplicateSkills = (skills: SkillEntry[]) => {
                        const seen = new Set();
                        return skills.filter(skill => {
                            if (seen.has(skill.skill_id)) {
                                return false;
                            }
                            seen.add(skill.skill_id);
                            return true;
                        });
                    };

                    data.report.skill_breakdown.met_skills = deduplicateSkills(
                        data.report.skill_breakdown.met_skills || []
                    );
                    data.report.skill_breakdown.missing_skills = deduplicateSkills(
                        data.report.skill_breakdown.missing_skills || []
                    );

                    data.report.skill_breakdown.met_count = data.report.skill_breakdown.met_skills.length;
                    data.report.skill_breakdown.missing_count = data.report.skill_breakdown.missing_skills.length;
                    data.report.skill_breakdown.total_skills =
                        data.report.skill_breakdown.met_count + data.report.skill_breakdown.missing_count;
                }

                setReport(data);
            } else {
                setError({
                    type: data.error === 'NO_READINESS' ? 'no_readiness' : 'error',
                    message: data.message || 'Failed to load report',
                });
            }
        } catch (err) {
            console.error('[ReportPage] Error fetching report:', err);
            setError({
                type: 'error',
                message: 'Failed to load report. Please try again later.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Initial fetch
    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Handle PDF export
    const handleExportPDF = async () => {
        setIsExporting(true);

        try {
            const html2pdf = (await import('html2pdf.js')).default;

            const element = reportRef.current;
            if (!element) {
                throw new Error('Report element not found');
            }

            const date = new Date().toISOString().split('T')[0];

            const opt = {
                margin: [10, 10, 10, 10] as [number, number, number, number],
                filename: `readiness-report-${userName.replace(/\s+/g, '-')}-${date}.pdf`,
                image: {
                    type: 'jpeg',
                    quality: 0.98,
                } as const,
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    onclone: (clonedDoc: Document) => {
                        // Remove external stylesheets
                        const stylesheets = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
                        stylesheets.forEach(sheet => sheet.remove());

                        // Apply theme color to elements
                        const coloredElements = clonedDoc.querySelectorAll('[class*="blue-"]');
                        coloredElements.forEach(el => {
                            const element = el as HTMLElement;
                            if (element.className.includes('text-blue-')) {
                                element.style.color = '#5693C1';
                            }
                            if (element.className.includes('bg-blue-')) {
                                element.style.backgroundColor = '#5693C1';
                            }
                            if (element.className.includes('border-blue-')) {
                                element.style.borderColor = '#5693C1';
                            }
                        });
                    }
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                } as const,
            };

            await html2pdf().set(opt).from(element).save();

        } catch (err) {
            console.error('PDF export error:', err);
            alert('Failed to export PDF. Try using the Print option instead.');
        } finally {
            setIsExporting(false);
        }
    };

    // Calculate trend from history
    const calculateTrend = (history: HistoryEntry[] | undefined) => {
        if (!history || history.length < 2) {
            return { direction: 'stable', icon: Minus, color: 'text-gray-500', text: 'No history' };
        }

        const recent = history.slice(0, 3);
        const newest = recent[0]?.percentage || 0;
        const oldest = recent[recent.length - 1]?.percentage || 0;
        const diff = newest - oldest;

        if (diff > 5) return { direction: 'up', icon: TrendingUp, color: 'text-green-600', text: `+${diff}% improvement` };
        if (diff < -5) return { direction: 'down', icon: TrendingDown, color: 'text-red-600', text: `${diff}% decline` };
        return { direction: 'stable', icon: Minus, color: 'text-gray-500', text: 'Stable' };
    };

    // Get source label
    const getSourceIcon = (source?: string) => {
        switch (source) {
            case 'self': return UserCheck;
            case 'resume': return FileText;
            case 'validated': return Award;
            default: return Info;
        }
    };

    // Get score circle color
    const getScoreColor = (color?: string) => {
        switch (color) {
            case 'danger': return 'border-red-500';
            case 'warning': return 'border-amber-500';
            case 'success': return 'border-green-500';
            default: return 'border-[#5693C1]';
        }
    };

    // ============================================================================
    // Render: Loading State
    // ============================================================================
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-[#5693C1] rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-gray-600 mt-6 text-lg">Generating your readiness report...</p>
                        <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================================
    // Render: Error State
    // ============================================================================
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                        {error.type === 'no_readiness' ? (
                            <>
                                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <BarChart3 className="w-10 h-10 text-amber-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">No Readiness Data Found</h2>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                    You need to calculate your readiness score before generating a report.
                                </p>
                                <Link
                                    href="/readiness"
                                    className="px-8 py-3 bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:-translate-y-1 inline-flex items-center gap-2"
                                >
                                    <Target className="w-4 h-4" />
                                    Calculate Readiness First
                                </Link>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle className="w-10 h-10 text-red-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Report</h2>
                                <p className="text-gray-600 mb-8">{error.message}</p>
                                <button
                                    onClick={fetchReport}
                                    className="px-8 py-3 bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:-translate-y-1 inline-flex items-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Try Again
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================================
    // Prepare Data
    // ============================================================================
    const { user: reportUser, readiness, skill_breakdown, validation, roadmap, history } = report?.report || {};
    const trend = calculateTrend(history);
    const TrendIcon = trend.icon;
    const hasPendingValidation = (validation?.pending_validation || 0) > 0;

    // Combine all skills for table view
    const allSkills: SkillEntry[] = [
        ...(skill_breakdown?.met_skills || []).map(s => ({ ...s, status: 'met' as const })),
        ...(skill_breakdown?.missing_skills || []).map(s => ({ ...s, status: 'missing' as const })),
    ];

    // ============================================================================
    // Render: Main Page
    // ============================================================================
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#5693C1]/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#3a6a8c]/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Page Header with breadcrumb */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Link href="/dashboard" className="hover:text-[#5693C1] transition-colors">Dashboard</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 font-medium">Report</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            Readiness Report
                        </h1>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                                Generated for <span className="font-medium text-gray-900">{reportUser?.name || userName}</span>
                            </span>
                        </div>
                    </div>

                    <p className="text-gray-600 mt-2 ml-14 max-w-2xl">
                        Your defensible proof of skill readiness for{' '}
                        <span className="font-semibold text-[#5693C1]">
                            {reportUser?.target_role?.category_name || 'your target role'}
                        </span>
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 mb-8 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300 inline-flex items-center justify-center gap-2 text-sm hover:-translate-y-1"
                    >
                        <Printer className="w-4 h-4" />
                        Print Report
                    </button>
                    <button
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 inline-flex items-center justify-center gap-2 text-sm"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Export as PDF
                            </>
                        )}
                    </button>
                </div>

                {/* Report Content */}
                <div
                    ref={reportRef}
                    id="readiness-report"
                    className="font-sans bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden print:border-0 print:rounded-none"
                >
                    {/* Report Header */}
                    <div className="p-8 border-b-4" style={{ borderColor: '#5693C1' }}>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] rounded-lg flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">READINESS REPORT</span>
                                    {hasPendingValidation && (
                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Validation Pending
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-500 text-sm">Candidate: </span>
                                        <span className="font-semibold text-gray-900">{reportUser?.name || userName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-500 text-sm">Target Role: </span>
                                        <span className="font-semibold" style={{ color: '#5693C1' }}>
                                            {reportUser?.target_role?.category_name || 'Not specified'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 justify-end">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <div className="text-sm text-gray-500">Generated on</div>
                                </div>
                                <div className="font-semibold text-gray-900 text-lg">
                                    {new Date(report?.generated_at || new Date()).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {new Date(report?.generated_at || new Date()).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Report Body */}
                    <div className="p-8">
                        {/* Validation Pending Disclaimer */}
                        {hasPendingValidation && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 flex items-start gap-4">
                                <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="font-semibold text-amber-800 mb-1">Validation Pending</div>
                                    <div className="text-amber-700 text-sm">
                                        {validation?.pending_validation} skill(s) are awaiting mentor review.
                                        Scores may change after validation.
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECTION 1: READINESS SUMMARY */}
                        <div className="mb-10">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                                Readiness Summary
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Score Circle */}
                                <div className="flex justify-center lg:justify-start">
                                    <div className="relative">
                                        <svg className="w-40 h-40 transform -rotate-90">
                                            <circle
                                                className="text-gray-200"
                                                strokeWidth="8"
                                                stroke="currentColor"
                                                fill="transparent"
                                                r="72"
                                                cx="80"
                                                cy="80"
                                            />
                                            <circle
                                                className={readiness?.status_color === 'danger' ? 'text-red-500' :
                                                    readiness?.status_color === 'warning' ? 'text-amber-500' :
                                                        readiness?.status_color === 'success' ? 'text-green-500' :
                                                            'text-[#5693C1]'}
                                                strokeWidth="8"
                                                strokeDasharray={452}
                                                strokeDashoffset={452 - (452 * (readiness?.percentage || 0)) / 100}
                                                strokeLinecap="round"
                                                stroke="currentColor"
                                                fill="transparent"
                                                r="72"
                                                cx="80"
                                                cy="80"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-bold text-gray-900">{readiness?.percentage || 0}%</span>
                                            <span className="text-xs text-gray-500">Readiness</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Details */}
                                <div className="lg:col-span-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100">
                                            <div className="text-sm text-gray-500 mb-2">Status</div>
                                            <StatusBadge
                                                label={readiness?.status_label || 'Unknown'}
                                                color={readiness?.status_color || 'primary'}
                                            />
                                            <div className="mt-3 text-sm text-gray-600">
                                                Last calculated: {readiness?.calculated_at
                                                    ? new Date(readiness.calculated_at).toLocaleDateString('en-US', {
                                                        month: 'short', day: 'numeric', year: 'numeric'
                                                    })
                                                    : 'Never'}
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100">
                                            <div className="text-sm text-gray-500 mb-2">Skills Match</div>
                                            <div className="text-2xl font-bold text-gray-900">
                                                {skill_breakdown?.met_count || 0}/{skill_breakdown?.total_skills || 0}
                                            </div>
                                            <div className="mt-2">
                                                <ProgressBar
                                                    percentage={((skill_breakdown?.met_count || 0) / (skill_breakdown?.total_skills || 1)) * 100}
                                                    height={6}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 sm:col-span-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendIcon className={`w-4 h-4 ${trend.color}`} />
                                                <span className={`text-sm font-medium ${trend.color}`}>
                                                    {trend.text}
                                                </span>
                                            </div>
                                            {history && history.length > 0 && (
                                                <div className="flex items-center gap-2">
                                                    {history.slice(0, 3).map((entry, idx) => (
                                                        <div key={idx} className="flex-1">
                                                            <div className="text-xs text-gray-500 mb-1">
                                                                {new Date(entry.calculated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            </div>
                                                            <ProgressBar percentage={entry.percentage} color={entry.status_color} height={4} />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: SKILL BREAKDOWN */}
                        <div className="mb-10">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                                    <ListChecks className="w-3.5 h-3.5 text-green-600" />
                                </div>
                                Skill Breakdown
                                <span className="text-sm font-normal text-gray-500 ml-2">
                                    ({skill_breakdown?.met_count || 0} met, {skill_breakdown?.missing_count || 0} missing)
                                </span>
                            </h2>

                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200">
                                                <th className="text-left px-6 py-4 text-gray-700 font-semibold">Skill</th>
                                                <th className="text-center px-6 py-4 text-gray-700 font-semibold">Status</th>
                                                <th className="text-center px-6 py-4 text-gray-700 font-semibold">Source</th>
                                                <th className="text-center px-6 py-4 text-gray-700 font-semibold">Importance</th>
                                                <th className="text-center px-6 py-4 text-gray-700 font-semibold">Weight</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allSkills.map((skill, idx) => {
                                                const SourceIcon = getSourceIcon(skill.source);
                                                return (
                                                    <tr
                                                        key={skill.skill_id || idx}
                                                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${skill.status === 'met' ? 'bg-green-50/30' : 'bg-red-50/30'
                                                            }`}
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                {skill.is_validated && (
                                                                    <Award className="w-4 h-4 text-emerald-500" />
                                                                )}
                                                                <span className="font-medium text-gray-900">
                                                                    {skill.skill_name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="text-center px-6 py-4">
                                                            <StatusBadge
                                                                label={skill.status === 'met' ? 'Met' : 'Missing'}
                                                                color={skill.status === 'met' ? 'success' : 'danger'}
                                                                size="small"
                                                            />
                                                        </td>
                                                        <td className="text-center px-6 py-4">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <SourceIcon className="w-4 h-4 text-gray-400" />
                                                                <span className="text-gray-600">
                                                                    {skill.source === 'self' ? 'Self' :
                                                                        skill.source === 'resume' ? 'Resume' :
                                                                            skill.source === 'validated' ? 'Validated' : 'Unknown'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="text-center px-6 py-4">
                                                            {skill.importance === 'required' ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                                                    <Star className="w-3 h-3" />
                                                                    Required
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs">Optional</span>
                                                            )}
                                                        </td>
                                                        <td className="text-center px-6 py-4 text-gray-600">
                                                            {skill.weight || '-'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs">
                                <span className="text-gray-500">Legend:</span>
                                <span className="flex items-center gap-1">
                                    <Award className="w-3.5 h-3.5 text-emerald-500" /> Validated
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 text-amber-500" /> Required
                                </span>
                                <span className="flex items-center gap-1">
                                    <UserCheck className="w-3.5 h-3.5 text-blue-500" /> Self
                                </span>
                                <span className="flex items-center gap-1">
                                    <FileText className="w-3.5 h-3.5 text-purple-500" /> Resume
                                </span>
                            </div>
                        </div>

                        {/* SECTION 3: ROADMAP PRIORITIES */}
                        <div className="mb-10">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                                </div>
                                Roadmap Priorities
                            </h2>

                            {roadmap ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-5 border border-red-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                                                    <Zap className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-red-600">{roadmap?.by_priority?.high || 0}</div>
                                                    <div className="text-xs text-red-700 font-medium">HIGH PRIORITY</div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-red-600">Critical skills to focus on first</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-5 border border-amber-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                                                    <TrendingUp className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-amber-600">{roadmap?.by_priority?.medium || 0}</div>
                                                    <div className="text-xs text-amber-700 font-medium">MEDIUM PRIORITY</div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-amber-600">Recommended for steady progress</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-5 border border-green-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                                    <Clock className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-green-600">{roadmap?.by_priority?.low || 0}</div>
                                                    <div className="text-xs text-green-700 font-medium">LOW PRIORITY</div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-green-600">Complete after higher priorities</p>
                                        </div>
                                    </div>

                                    {/* Top Focus Areas */}
                                    {roadmap?.high_priority_items && roadmap.high_priority_items.length > 0 && (
                                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-amber-500" />
                                                Immediate Focus Areas
                                            </h3>
                                            <div className="space-y-3">
                                                {roadmap.high_priority_items.slice(0, 3).map((item, idx) => (
                                                    <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
                                                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <span className="text-xs font-bold text-red-600">{idx + 1}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-900">{item.skill_name}</span>
                                                            <p className="text-sm text-gray-500 mt-1">{item.reason}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Why this matters */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 flex items-start gap-3">
                                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Info className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <span className="font-semibold text-blue-800 block mb-1">Why this matters:</span>
                                            <p className="text-sm text-blue-700">
                                                High priority items represent required skills that are either missing or rejected.
                                                Addressing these first will have the biggest impact on your readiness score.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-12 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <GraduationCap className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600">No roadmap generated yet.</p>
                                    <p className="text-sm text-gray-400 mt-1">Visit the Roadmap page to generate one.</p>
                                </div>
                            )}
                        </div>

                        {/* SECTION 4: PROGRESS SNAPSHOT */}
                        <div className="mb-10">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <History className="w-3.5 h-3.5 text-emerald-600" />
                                    </div>
                                    Progress Snapshot
                                </div>
                                <span className={`text-sm font-medium flex items-center gap-1 ${trend.color}`}>
                                    <TrendIcon className="w-4 h-4" />
                                    {trend.text}
                                </span>
                            </h2>

                            {history && history.length > 0 ? (
                                <div className="space-y-4">
                                    {history.slice(0, 5).map((entry, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border ${idx === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 w-full sm:w-32">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {new Date(entry.calculated_at).toLocaleDateString('en-US', {
                                                        month: 'short', day: 'numeric', year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <ProgressBar percentage={entry.percentage} color={entry.status_color} height={8} showLabel />
                                            </div>
                                            <StatusBadge
                                                label={entry.status_label}
                                                color={entry.status_color}
                                                size="small"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-12 bg-gray-50 rounded-xl border border-gray-200">
                                    <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No historical data available yet.</p>
                                </div>
                            )}
                        </div>

                        {/* SECTION 5: FOOTER */}
                        <div className="mt-10 pt-8 border-t-2 border-gray-200">
                            <div className="text-center mb-6">
                                <div className="text-sm font-semibold text-gray-700 flex items-center justify-center gap-2">
                                    <FileText className="w-4 h-4 text-[#5693C1]" />
                                    Generated by RoleReady
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    {new Date(report?.generated_at || new Date()).toLocaleString()}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 text-sm text-gray-600 border border-gray-200">
                                <div className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-[#5693C1]" />
                                    Explainability Note
                                </div>
                                <p className="mb-3">
                                    This report is <strong>rule-based and evidence-driven</strong>. Every data point is traceable:
                                </p>
                                <ul className="space-y-2 ml-4">
                                    {[
                                        'Readiness scores are calculated from skill matches against role requirements',
                                        'Skills are sourced from self-claims, resume parsing, or mentor validation',
                                        'Roadmap priorities follow deterministic rules (no AI interpretation)',
                                        'All calculations are reproducible and auditable'
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
                    <Link
                        href="/dashboard"
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300 hover:-translate-y-1 inline-flex items-center gap-2 justify-center"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <Link
                        href="/readiness"
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300 hover:-translate-y-1 inline-flex items-center gap-2 justify-center"
                    >
                        View Readiness
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        background-color: white !important;
                    }
                    
                    .print\\:hidden {
                        display: none !important;
                    }
                    
                    #readiness-report {
                        box-shadow: none !important;
                        border: 1px solid #ddd !important;
                    }
                    
                    .text-gray-900 {
                        color: #111827 !important;
                    }
                    
                    .text-blue-600, .text-\\[#5693C1\\] {
                        color: #5693C1 !important;
                    }
                    
                    .bg-blue-600, .bg-\\[#5693C1\\] {
                        background-color: #5693C1 !important;
                    }
                    
                    .border-blue-600, .border-\\[#5693C1\\] {
                        border-color: #5693C1 !important;
                    }
                }
            `}</style>
        </div>
    );
}