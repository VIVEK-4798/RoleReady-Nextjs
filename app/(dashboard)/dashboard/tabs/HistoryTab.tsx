/**
 * Dashboard History Tab
 * 
 * Shows readiness score history with date, score, change, and status.
 * Faithful recreation from the old RoleReady React project.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface HistoryItem {
  id: string;
  roleId: string;
  roleName?: string;
  percentage: number;
  hasAllRequired: boolean;
  requiredSkillsMet: number;
  requiredSkillsTotal: number;
  totalBenchmarks: number;
  skillsMatched: number;
  skillsMissing: number;
  trigger: string;
  triggerDetails?: string;
  createdAt: string;
}

interface HistoryTabProps {
  userId: string;
}

export default function HistoryTab({ userId }: HistoryTabProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch history data
  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch(`/api/users/${userId}/readiness/history?limit=50`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load history');
      }

      if (data.success && data.history) {
        setHistory(data.history);
      } else {
        throw new Error(data.error || 'Failed to load history');
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Calculate change from previous
  const getChange = (index: number): number | null => {
    if (index >= history.length - 1) return null;
    return history[index].percentage - history[index + 1].percentage;
  };

  // Get status styling
  const getStatusStyle = (percentage: number) => {
    if (percentage >= 70) {
      return { label: 'Ready', className: 'bg-green-100 text-green-700' };
    } else if (percentage >= 40) {
      return { label: 'Partial', className: 'bg-yellow-100 text-yellow-700' };
    } else {
      return { label: 'Not Ready', className: 'bg-red-100 text-red-700' };
    }
  };

  // Get trigger label
  const getTriggerLabel = (trigger: string) => {
    const triggers: Record<string, string> = {
      manual: 'Manual',
      skill_added: 'Skill Added',
      skill_updated: 'Skill Updated',
      skill_deleted: 'Skill Deleted',
      skill_validated: 'Skill Validated',
      resume_parsed: 'Resume Parsed',
      role_changed: 'Role Changed',
      initial: 'Initial',
    };
    return triggers[trigger] || trigger;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-100 rounded animate-pulse w-48" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load History</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchHistory}
            className="px-4 py-2 bg-[#5693C1] hover:bg-[#4a80b0] text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-[#5693C1]/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-[#5693C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No History Yet</h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            Your readiness score history will appear here after you calculate your first readiness score.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Readiness History</h2>
        <p className="text-sm text-gray-500 mt-1">
          Track your readiness score changes over time
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trigger</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {history.map((item, index) => {
              const change = getChange(index);
              const status = getStatusStyle(item.percentage);
              
              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{formatDate(item.createdAt)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.percentage >= 70 ? 'bg-green-500' : 
                            item.percentage >= 40 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{Math.round(item.percentage)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {change !== null ? (
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                        change > 0 ? 'text-green-600' : 
                        change < 0 ? 'text-red-600' : 
                        'text-gray-500'
                      }`}>
                        {change > 0 && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        )}
                        {change < 0 && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        )}
                        {change === 0 ? '—' : `${change > 0 ? '+' : ''}${change.toFixed(1)}%`}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{getTriggerLabel(item.trigger)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {item.skillsMatched}/{item.totalBenchmarks}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          Showing {history.length} record{history.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}