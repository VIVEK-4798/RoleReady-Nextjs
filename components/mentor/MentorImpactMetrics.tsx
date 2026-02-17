'use client';

import {
    Users,
    CheckCircle,
    Award,
    TrendingUp,
    Clock,
    Target
} from 'lucide-react';

interface MentorImpactMetricsProps {
    stats: {
        pendingValidations: number;
        totalValidations: number;
        activeStudents: number;
        validatedToday: number;
        avgResponseTime: string;
        completionRate: number;
    };
}

export default function MentorImpactMetrics({ stats }: MentorImpactMetricsProps) {
    const metrics = [
        {
            title: 'Total Learners',
            value: stats.activeStudents,
            icon: <Users className="w-5 h-5" />,
            color: 'blue',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            borderColor: 'border-blue-100',
            description: 'Assigned to you'
        },
        {
            title: 'Pending Validations',
            value: stats.pendingValidations,
            icon: <Clock className="w-5 h-5" />,
            color: 'amber',
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-600',
            borderColor: 'border-amber-100',
            description: 'Awaiting review'
        },
        {
            title: 'Skills Validated',
            value: stats.totalValidations,
            icon: <CheckCircle className="w-5 h-5" />,
            color: 'emerald',
            bgColor: 'bg-emerald-50',
            textColor: 'text-emerald-600',
            borderColor: 'border-emerald-100',
            description: 'All time'
        },
        {
            title: 'Completion Rate',
            value: `${stats.completionRate}%`,
            icon: <Target className="w-5 h-5" />,
            color: 'purple',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
            borderColor: 'border-purple-100',
            description: 'Efficiency'
        }
    ];

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Your Impact</h2>
                    <p className="text-sm text-gray-500 mt-1">Measurable mentor contributions</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5693C1] to-cyan-500 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-xl border ${metric.borderColor} ${metric.bgColor} hover:shadow-md transition-all duration-200 group`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-lg ${metric.bgColor} ${metric.textColor} flex items-center justify-center border ${metric.borderColor} group-hover:scale-110 transition-transform`}>
                                {metric.icon}
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                            {metric.value}
                        </div>
                        <div className="text-xs font-semibold text-gray-700 mb-1">
                            {metric.title}
                        </div>
                        <div className="text-xs text-gray-500">
                            {metric.description}
                        </div>
                    </div>
                ))}
            </div>

            {/* Additional Insights */}
            <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Validated Today</div>
                        <div className="text-lg font-bold text-[#5693C1]">{stats.validatedToday}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Avg Response Time</div>
                        <div className="text-lg font-bold text-[#5693C1]">{stats.avgResponseTime}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
