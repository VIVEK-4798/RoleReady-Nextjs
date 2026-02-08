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
    <div className="space-y-6">
      {/* Page Header - Matching old dashboard structure */}
      <div className="py-6 px-6 rounded-xl bg-white shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          {/* Title and Target Role */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-gray-900">
              Readiness Dashboard
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Welcome back,</span>
              <span 
                className="text-sm font-semibold text-[#5693C1] flex items-center gap-1 px-3 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(86, 147, 193, 0.1)' }}
              >
                {user?.name?.split(' ')[0] || 'User'}
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
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#5693C1] border border-[#5693C1] rounded-lg hover:bg-[#5693C1]/5 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:ring-offset-2"
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
        <div className="flex gap-1 mt-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:ring-offset-2 rounded-t-lg ${
              activeTab === 'overview'
                ? 'border-[#5693C1] text-[#5693C1] bg-[#5693C1]/5'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
            className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:ring-offset-2 rounded-t-lg ${
              activeTab === 'history'
                ? 'border-[#5693C1] text-[#5693C1] bg-[#5693C1]/5'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
            className={`px-4 sm:px-6 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:ring-offset-2 rounded-t-lg ${
              activeTab === 'trends'
                ? 'border-[#5693C1] text-[#5693C1] bg-[#5693C1]/5'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
        <div className="rounded-xl bg-gradient-to-r from-[#5693C1] to-[#4a80b0] p-6 lg:p-8 text-white">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold mb-2">
                Ready to improve your score?
              </h2>
              <p className="text-blue-100 text-sm lg:text-base">
                Update your skills or retake assessment to refresh your readiness score.
              </p>
            </div>
            <button className="px-6 py-3 bg-white text-[#5693C1] font-semibold rounded-lg hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#5693C1]">
              Retake Assessment
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Readiness Score</p>
              <p className="text-2xl font-bold text-gray-900">78%</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Skills Validated</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-[#5693C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Out of 32 required</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Role</p>
              <p className="text-2xl font-bold text-gray-900">Frontend</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Target: Senior Level</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Days Active</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Joined 45 days ago</p>
        </div>
      </div>
    </div>
  );
}