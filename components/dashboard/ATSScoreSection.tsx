'use client';

import { useState, useEffect } from 'react';
import {
    FileText,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Target,
    Layers,
    Zap,
    FileCheck
} from 'lucide-react';

interface ATSScoreBreakdown {
    relevance: number;
    contextDepth: number;
    structure: number;
    impact: number;
}

interface ATSScoreData {
    overallScore: number;
    breakdown: ATSScoreBreakdown;
    missingKeywords: string[];
    suggestions: string[];
    calculatedAt: string;
    isOutdated?: boolean;
}

export default function ATSScoreSection() {
    const [atsData, setAtsData] = useState<ATSScoreData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchATSScore();
    }, []);

    const fetchATSScore = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/ats-score');
            const result = await response.json();

            if (!response.ok) {
                if (response.status === 404) {
                    setAtsData(null);
                    return;
                }
                throw new Error(result.error || 'Failed to fetch ATS score');
            }

            setAtsData({
                ...result.data.atsScore,
                isOutdated: result.data.isOutdated
            });
        } catch (err: any) {
            console.error('Failed to fetch ATS score:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRecalculate = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/ats-score', { method: 'POST' });
            const result = await response.json();

            if (!response.ok) throw new Error(result.error || 'Recalculation failed');

            setAtsData({
                ...result.data.atsScore,
                isOutdated: false
            });
        } catch (err: any) {
            console.error('Recalculate failed:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-blue-600';
        if (score >= 40) return 'text-amber-600';
        return 'text-red-600';
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return 'bg-emerald-50 border-emerald-200';
        if (score >= 60) return 'bg-blue-50 border-blue-200';
        if (score >= 40) return 'bg-amber-50 border-amber-200';
        return 'bg-red-50 border-red-200';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Improvement';
    };

    const componentDetails = [
        {
            key: 'relevance' as keyof ATSScoreBreakdown,
            label: 'Keyword Relevance',
            icon: <Target className="w-5 h-5" />,
            description: 'How well your resume matches required skills',
            weight: '40%'
        },
        {
            key: 'contextDepth' as keyof ATSScoreBreakdown,
            label: 'Skill Context',
            icon: <Layers className="w-5 h-5" />,
            description: 'Depth and quality of skill descriptions',
            weight: '25%'
        },
        {
            key: 'structure' as keyof ATSScoreBreakdown,
            label: 'Resume Structure',
            icon: <FileCheck className="w-5 h-5" />,
            description: 'Proper sections and formatting',
            weight: '20%'
        },
        {
            key: 'impact' as keyof ATSScoreBreakdown,
            label: 'Impact Language',
            icon: <Zap className="w-5 h-5" />,
            description: 'Use of action verbs and achievements',
            weight: '15%'
        }
    ];

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5693C1] to-cyan-500 flex items-center justify-center animate-pulse">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Resume Compatibility Score</h2>
                        <p className="text-sm text-gray-500">Analyzing your resume...</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Resume Compatibility Score</h2>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                </div>
                <button
                    onClick={fetchATSScore}
                    className="px-4 py-2 bg-[#5693C1] text-white rounded-lg hover:bg-[#4a80b0] transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!atsData) {
        return null;
    }

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            {atsData.isOutdated && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-4 animate-pulse">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <div>
                            <h3 className="font-semibold text-amber-900">Score Outdated</h3>
                            <p className="text-sm text-amber-700">Resume or role updated. Recalculate for latest score.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleRecalculate}
                        className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-sm font-medium transition-colors"
                    >
                        Recalculate
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5693C1] to-cyan-500 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Resume Compatibility Score</h2>
                        <p className="text-sm text-gray-500">
                            How well your resume aligns with your target role's requirements
                        </p>
                    </div>
                </div>
            </div>

            {/* Overall Score */}
            <div className={`p-6 rounded-xl border-2 mb-6 ${getScoreBgColor(atsData.overallScore)}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-semibold text-gray-600 mb-1">Overall ATS Score</div>
                        <div className={`text-5xl font-bold ${getScoreColor(atsData.overallScore)}`}>
                            {atsData.overallScore}
                            <span className="text-2xl">/100</span>
                        </div>
                        <div className="text-sm font-medium text-gray-600 mt-2">
                            {getScoreLabel(atsData.overallScore)}
                        </div>
                    </div>
                    <div className="w-24 h-24 rounded-full bg-white/50 flex items-center justify-center">
                        <TrendingUp className={`w-12 h-12 ${getScoreColor(atsData.overallScore)}`} />
                    </div>
                </div>
            </div>

            {/* Component Breakdown */}
            <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Score Breakdown</h3>
                <div className="space-y-4">
                    {componentDetails.map((component) => {
                        const score = atsData.breakdown[component.key];
                        const percentage = score;

                        return (
                            <div key={component.key} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-lg ${getScoreBgColor(score)} flex items-center justify-center`}>
                                            <span className={getScoreColor(score)}>{component.icon}</span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">
                                                {component.label}
                                                <span className="ml-2 text-xs text-gray-500 font-normal">({component.weight})</span>
                                            </div>
                                            <div className="text-xs text-gray-500">{component.description}</div>
                                        </div>
                                    </div>
                                    <div className={`text-lg font-bold ${getScoreColor(score)}`}>
                                        {score}
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${score >= 80 ? 'bg-emerald-500' :
                                            score >= 60 ? 'bg-blue-500' :
                                                score >= 40 ? 'bg-amber-500' :
                                                    'bg-red-500'
                                            }`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Missing Keywords */}
            {atsData.missingKeywords.length > 0 && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-amber-900">Missing Keywords</h4>
                            <p className="text-xs text-amber-700 mt-1">
                                These skills from the role requirements don't appear in your resume:
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                        {atsData.missingKeywords.slice(0, 10).map((keyword, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-white border border-amber-300 text-amber-800 text-xs font-medium rounded-full"
                            >
                                {keyword}
                            </span>
                        ))}
                        {atsData.missingKeywords.length > 10 && (
                            <span className="px-3 py-1 text-amber-700 text-xs font-medium">
                                +{atsData.missingKeywords.length - 10} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Suggestions */}
            {atsData.suggestions.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-2 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <h4 className="text-sm font-bold text-blue-900">Improvement Suggestions</h4>
                    </div>
                    <ul className="space-y-2">
                        {atsData.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Disclaimer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                    This score estimates how well your resume aligns with your target role's requirements.
                    It does not guarantee ATS system compatibility or job application success.
                </p>
            </div>
        </div>
    );
}
