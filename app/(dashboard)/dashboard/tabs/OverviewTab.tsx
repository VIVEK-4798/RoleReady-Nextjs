'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ContributionGraph } from '@/components/activity';

interface ReadinessData {
  hasTargetRole: boolean;
  snapshot: {
    id: string;
    roleId: string;
    totalScore: number;
    maxPossibleScore: number;
    percentage: number;
    hasAllRequired: boolean;
    requiredSkillsMet: number;
    requiredSkillsTotal: number;
    totalBenchmarks: number;
    skillsMatched: number;
    skillsMissing: number;
    trigger: string;
    createdAt: string;
    breakdown: SkillBreakdown[];
  } | null;
  message?: string;
}

interface SkillBreakdown {
  skillId: string;
  skillName: string;
  importance: string;
  weight: number;
  requiredLevel: string;
  userLevel: string;
  levelPoints: number;
  validationMultiplier: number;
  rawScore: number;
  weightedScore: number;
  maxPossibleScore: number;
  meetsRequirement: boolean;
  isMissing: boolean;
  source: string;
  validationStatus: string;
}

interface TargetRoleData {
  hasActiveRole: boolean;
  targetRole?: {
    id: string;
    roleId: string;
    roleName: string;
    isPrimary: boolean;
  };
}

interface ContributionData {
  startDate: string;
  endDate: string;
  contributions: Record<string, number>;
  totalContributions: number;
}

interface OverviewTabProps {
  userId: string;
}

export default function OverviewTab({ userId }: OverviewTabProps) {
  const [readiness, setReadiness] = useState<ReadinessData | null>(null);
  const [targetRole, setTargetRole] = useState<TargetRoleData | null>(null);
  const [contributionData, setContributionData] = useState<ContributionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState('');

  // Fetch all data on mount
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Parallel fetch
      const [readinessRes, targetRoleRes, contributionRes] = await Promise.all([
        fetch(`/api/users/${userId}/readiness`),
        fetch(`/api/users/${userId}/target-role`),
        fetch('/api/activity/contributions'),
      ]);

      const [readinessData, targetRoleData, contributionDataRes] = await Promise.all([
        readinessRes.json(),
        targetRoleRes.json(),
        contributionRes.json(),
      ]);

      if (readinessData.success) {
        setReadiness(readinessData);
      }
      if (targetRoleData.success) {
        setTargetRole({
          hasActiveRole: targetRoleData.data.hasTargetRole,
          targetRole: targetRoleData.data.targetRole,
        });
      }
      if (contributionDataRes.success) {
        setContributionData(contributionDataRes);
      }
    } catch (err) {
      console.error('Error fetching overview data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle recalculate readiness
  const handleRecalculate = async () => {
    setIsCalculating(true);
    try {
      const response = await fetch(`/api/users/${userId}/readiness`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'manual' }),
      });
      const data = await response.json();
      if (data.success) {
        // Refresh data after recalculation
        await fetchData();
      } else {
        setError(data.error || 'Failed to recalculate readiness');
      }
    } catch (err) {
      console.error('Error recalculating:', err);
      setError('Failed to recalculate readiness');
    } finally {
      setIsCalculating(false);
    }
  };

  // Get readiness status styling
  const getReadinessStatus = (percentage: number) => {
    if (percentage >= 70) {
      return { label: 'Ready', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30', icon: '✅' };
    } else if (percentage >= 40) {
      return { label: 'Partially Ready', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', icon: '⚠️' };
    } else {
      return { label: 'Not Ready', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30', icon: '❌' };
    }
  };

  // Get validation badge
  const getValidationBadge = (skill: SkillBreakdown) => {
    if (skill.validationStatus === 'validated') {
      return { icon: '🎓', label: 'Validated', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-300 dark:border-blue-700' };
    }
    if (skill.validationStatus === 'rejected') {
      return { icon: '⚠️', label: 'Rejected', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700' };
    }
    if (skill.source === 'resume') {
      return { icon: '📄', label: 'Resume', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-300 dark:border-purple-700' };
    }
    return { icon: '✋', label: 'Self', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-300 dark:border-gray-600' };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  // No target role state
  if (!targetRole?.hasActiveRole) {
    return (
      <div className="space-y-6">
        {/* Empty State Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Target Role Selected</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Select a target role to see your readiness score. Your readiness is calculated based on how well your skills match the requirements for your chosen role.
          </p>
          <Link
            href="/dashboard/roles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Select Target Role
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Get Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/skills"
              className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Add Your Skills</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Start by adding skills you already have</p>
              </div>
            </Link>
            <Link
              href="/dashboard/roles"
              className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Choose Target Role</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Select the job roles you&apos;re aiming for</p>
              </div>
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Complete Profile</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add education and experience</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Contribution Graph */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity</h2>
          <ContributionGraph data={contributionData} loading={false} />
        </div>
      </div>
    );
  }

  // Handle case where role is selected but readiness data isn't loaded yet
  if (!readiness?.snapshot && !isCalculating) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Target Role Selected</h2>
          {targetRole?.targetRole && (
            <p className="text-gray-600 mb-4">
              Current target: <span className="font-semibold text-gray-900">{targetRole.targetRole.roleName}</span>
            </p>
          )}
          <p className="text-gray-600 mb-6">
            Calculate your readiness score to see how well your skills match the requirements.
          </p>
          <button
            onClick={handleRecalculate}
            disabled={isCalculating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Calculate Readiness
          </button>
          <div className="mt-4">
            <Link href="/dashboard/roles" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Change Target Role
            </Link>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity</h2>
          <ContributionGraph data={contributionData} loading={false} />
        </div>
      </div>
    );
  }

  const snapshot = readiness?.snapshot;
  const percentage = snapshot?.percentage || 0;
  const status = getReadinessStatus(percentage);

  return (
    <div className="space-y-6">
      {/* Readiness Score Card */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Readiness Score</h2>
              {targetRole?.targetRole && (
                <p className="text-gray-600">
                  Target: <span className="font-medium text-gray-900">{targetRole.targetRole.roleName}</span>{'  '}<Link href="/dashboard/roles" className="text-blue-600 hover:text-blue-700 text-sm font-medium">Change Role</Link>
                </p>
              )}
            </div>
            <button
              onClick={handleRecalculate}
              disabled={isCalculating}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isCalculating ? 'Calculating...' : 'Recalculate'}
            </button>
          </div>

          {/* Score Display */}
          <div className="flex items-center gap-8">
            {/* Circular Progress */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${percentage * 3.51} 351`}
                  className={percentage >= 70 ? 'text-green-500' : percentage >= 40 ? 'text-yellow-500' : 'text-red-500'}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{Math.round(percentage)}%</span>
              </div>
            </div>

            {/* Status & Stats */}
            <div className="flex-1">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${status.bgColor} ${status.color} mb-4`}>
                <span>{status.icon}</span>
                <span>{status.label}</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{snapshot?.skillsMatched || 0}</p>
                  <p className="text-sm text-gray-500">Skills Matched</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{snapshot?.skillsMissing || 0}</p>
                  <p className="text-sm text-gray-500">Skills Missing</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{snapshot?.requiredSkillsMet || 0}/{snapshot?.requiredSkillsTotal || 0}</p>
                  <p className="text-sm text-gray-500">Required Met</p>
                </div>
              </div>
            </div>
          </div>

          {/* Last calculated */}
          {snapshot?.createdAt && (
            <p className="mt-4 text-sm text-gray-500">
              Last calculated: {new Date(snapshot.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>
      </div>

      {/* Skill Breakdown */}
      {snapshot?.breakdown && snapshot.breakdown.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Breakdown</h3>
          <div className="space-y-3">
            {snapshot.breakdown.slice(0, 10).map((skill) => {
              const badge = getValidationBadge(skill);
              const scorePercent = skill.maxPossibleScore > 0 ? (skill.weightedScore / skill.maxPossibleScore) * 100 : 0;
              
              return (
                <div key={skill.skillId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 truncate">{skill.skillName}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${badge.className}`}>
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                      </span>
                      {skill.importance === 'required' && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs">Required</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${skill.meetsRequirement ? 'bg-green-500' : 'bg-yellow-500'}`}
                          style={{ width: `${Math.min(scorePercent, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {skill.userLevel || 'None'} / {skill.requiredLevel}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${skill.meetsRequirement ? 'text-green-600' : 'text-yellow-600'}`}>
                      {skill.meetsRequirement ? '✓ Met' : 'Gap'}
                    </p>
                  </div>
                </div>
              );
            })}
            {snapshot.breakdown.length > 10 && (
              <p className="text-sm text-gray-500 text-center">
                + {snapshot.breakdown.length - 10} more skills
              </p>
            )}
          </div>
        </div>
      )}

      {/* Contribution Graph */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity</h2>
        <ContributionGraph data={contributionData} loading={false} />
      </div>
    </div>
  );
}
