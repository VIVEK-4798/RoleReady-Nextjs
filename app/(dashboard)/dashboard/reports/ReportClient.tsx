/**
 * Readiness Report Client Component
 * 
 * Fetches and displays the readiness report with PDF export capability.
 * Uses browser's native print functionality for PDF generation.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { SkeletonReport, ProgressRing, SkillGapChart, Button } from '@/components/ui';

interface ReportData {
  generatedAt: string;
  snapshotDate: string;
  user: {
    name: string;
    email: string;
  };
  role: {
    id: string;
    name: string;
    description: string;
    colorClass: string;
  };
  readiness: {
    score: number;
    maxScore: number;
    percentage: number;
    hasAllRequired: boolean;
    requiredSkillsMet: number;
    requiredSkillsTotal: number;
    skillsMatched: number;
    skillsMissing: number;
    totalBenchmarks: number;
  };
  skills: Array<{
    id: string;
    name: string;
    importance: 'required' | 'optional';
    weight: number;
    requiredLevel: number;
    userLevel: number;
    meetsRequirement: boolean;
    isMissing: boolean;
    source: string | null;
    validationStatus: string | null;
    weightedScore: number;
    maxPossibleScore: number;
    scorePercentage: number;
  }>;
  roadmap: {
    id: string;
    title: string;
    status: string;
    totalSteps: number;
    completedSteps: number;
    progressPercentage: number;
    totalEstimatedHours: number;
    completedHours: number;
    readinessAtGeneration: number;
    projectedReadiness: number;
    steps: Array<{
      id: string;
      skillName: string;
      stepType: string;
      importance: 'required' | 'optional';
      currentLevel: number;
      targetLevel: number;
      status: string;
      priority: number;
      estimatedHours: number;
      actionDescription: string;
    }>;
    hasMoreSteps: boolean;
    remainingSteps: number;
  } | null;
}

const levelLabels: Record<number, string> = {
  0: 'None',
  1: 'Beginner',
  2: 'Basic',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

const validationLabels: Record<string, { label: string; color: string }> = {
  verified: { label: 'Verified', color: 'text-green-600' },
  pending: { label: 'Pending', color: 'text-yellow-600' },
  rejected: { label: 'Rejected', color: 'text-red-600' },
  unverified: { label: 'Unverified', color: 'text-gray-500' },
};

const stepTypeLabels: Record<string, string> = {
  learn_new: 'Learn New Skill',
  improve: 'Improve Skill',
  validate: 'Get Validated',
};

export default function ReportClient() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports/readiness');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load report');
      }

      setReport(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return <SkeletonReport />;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-md mx-auto text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Unable to Generate Report</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button onClick={fetchReport} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <>
      {/* Print-only styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-before: always;
          }
        }
      `}</style>

      {/* Header with export button */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Readiness Report</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generated {formatDate(report.generatedAt)}
          </p>
        </div>
        <Button
          onClick={handleExportPDF}
          variant="primary"
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        >
          Export PDF
        </Button>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="print-area space-y-6">
        {/* Report Header (for print) */}
        <div className="hidden print:block mb-8 text-center border-b pb-4">
          <h1 className="text-3xl font-bold">RoleReady - Readiness Report</h1>
          <p className="text-gray-600 mt-2">Generated on {formatDate(report.generatedAt)}</p>
        </div>

        {/* User & Role Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Candidate
              </h3>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{report.user.name}</p>
              <p className="text-gray-600 dark:text-gray-400">{report.user.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Target Role
              </h3>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{report.role.name}</p>
              {report.role.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">{report.role.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Readiness Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Readiness Overview</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {/* Main Score - Progress Ring */}
            <div className="md:col-span-1 flex justify-center">
              <ProgressRing
                percentage={report.readiness.percentage}
                size={140}
                strokeWidth={10}
                sublabel={`${report.readiness.score.toFixed(1)} / ${report.readiness.maxScore} pts`}
              />
            </div>

            {/* Stats */}
            <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {report.readiness.requiredSkillsMet}/{report.readiness.requiredSkillsTotal}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Required Skills Met</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {report.readiness.skillsMatched}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Skills Matched</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {report.readiness.skillsMissing}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Skills Missing</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <p className={`text-2xl font-bold ${report.readiness.hasAllRequired ? 'text-green-600' : 'text-red-600'}`}>
                  {report.readiness.hasAllRequired ? '✓' : '✗'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">All Required Met</p>
              </div>
            </div>
          </div>

          {/* Skill Gap Chart */}
          {report.skills.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Skill Gap Overview
              </h3>
              <SkillGapChart
                skills={report.skills.map((s) => ({
                  name: s.name,
                  current: s.userLevel,
                  required: s.requiredLevel,
                  importance: s.importance,
                }))}
                maxItems={6}
              />
            </div>
          )}
        </div>

        {/* Skills Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden print-break">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Skill-by-Skill Breakdown</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Skill
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Importance
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Required
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Your Level
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Validation
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {report.skills.map((skill) => (
                  <tr 
                    key={skill.id} 
                    className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${skill.isMissing ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900 dark:text-white">{skill.name}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        skill.importance === 'required'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {skill.importance}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                      {levelLabels[skill.requiredLevel]}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={skill.isMissing ? 'text-red-600' : 'text-gray-900 dark:text-white'}>
                        {skill.isMissing ? 'Missing' : levelLabels[skill.userLevel]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {skill.meetsRequirement ? (
                        <span className="text-green-600">✓ Met</span>
                      ) : (
                        <span className="text-red-600">✗ Gap</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {skill.validationStatus ? (
                        <span className={validationLabels[skill.validationStatus]?.color || 'text-gray-500'}>
                          {validationLabels[skill.validationStatus]?.label || skill.validationStatus}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={getScoreColor(skill.scorePercentage)}>
                        {skill.scorePercentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Roadmap Summary */}
        {report.roadmap && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 print-break">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Roadmap Summary</h2>
            
            {/* Roadmap Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {report.roadmap.completedSteps}/{report.roadmap.totalSteps}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Steps Completed</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {report.roadmap.progressPercentage}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {report.roadmap.totalEstimatedHours}h
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Est. Hours</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {report.roadmap.projectedReadiness}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Projected Readiness</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-purple-500"
                  style={{ width: `${report.roadmap.progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Steps List */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Next Steps
              </h3>
              {report.roadmap.steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-medium text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {step.skillName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stepTypeLabels[step.stepType] || step.stepType}: Level {step.currentLevel} → {step.targetLevel}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      step.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                      step.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {step.status.replace('_', ' ')}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ~{step.estimatedHours}h
                    </p>
                  </div>
                </div>
              ))}
              {report.roadmap.hasMoreSteps && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                  +{report.roadmap.remainingSteps} more steps in your roadmap
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer (for print) */}
        <div className="hidden print:block mt-8 pt-4 border-t text-center text-gray-500 text-sm">
          <p>RoleReady - Readiness Report</p>
          <p>Snapshot from: {formatDate(report.snapshotDate)}</p>
        </div>
      </div>
    </>
  );
}
