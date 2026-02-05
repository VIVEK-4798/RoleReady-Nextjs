/**
 * Dashboard Content Component
 * 
 * Tabbed dashboard with Overview, History, and Trends tabs.
 * Faithful recreation from the old RoleReady React project.
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks';
import { SkeletonDashboard } from '@/components/ui';
import { OverviewTab, HistoryTab, TrendsTab } from './tabs';

type TabType = 'overview' | 'history' | 'trends';

export default function DashboardContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    // Simulate refresh delay - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  if (isLoading) {
    return <SkeletonDashboard />;
  }

  // Format date helper
  const formatDate = (date: Date | string | null) => {
    if (!date) return '--';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6" style={{ background: '#f8fafc' }}>
      {/* Page Header - Matching old dashboard structure */}
      <div className="py-6 px-6 rounded-xl bg-white shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          {/* Title and Target Role */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: '#0f172a' }}>
              Readiness Dashboard
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Welcome back,</span>
              <span 
                className="text-sm font-semibold text-blue-600 flex items-center gap-1 px-3 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              >
                {user?.name?.split(' ')[0] || 'User'} 👋
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Updated:</span>
              <span className="text-sm font-medium text-gray-700">
                {formatDate(new Date())}
              </span>
            </div>
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <svg 
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Tabs - Matching old dashboard styling */}
        <div className="flex gap-1 mt-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Overview
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </span>
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'trends'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Trends
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && user?.id && <OverviewTab userId={user.id} />}
        {activeTab === 'history' && user?.id && <HistoryTab userId={user.id} />}
        {activeTab === 'trends' && user?.id && <TrendsTab userId={user.id} />}
      </div>

      {/* CTA Section - Matching old dashboard */}
      <div className="mt-8">
        <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 lg:p-8 text-white">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold mb-2">
                Ready to improve your score?
              </h2>
              <p className="text-blue-100 text-sm lg:text-base">
                Update your skills or retake assessment to refresh your readiness score.
              </p>
            </div>
            <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
              Retake Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
