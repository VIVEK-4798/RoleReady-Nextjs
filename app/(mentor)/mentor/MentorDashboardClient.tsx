/**
 * Mentor Dashboard Client Component
 * 
 * Shows overview stats and quick actions for mentor.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ContributionGraph } from '@/components/activity';

interface Stats {
  pendingValidations: number;
  validatedThisMonth: number;
  rejectedThisMonth: number;
  internshipsCount: number;
  jobsCount: number;
}

interface ContributionData {
  startDate: string;
  endDate: string;
  contributions: Record<string, number>;
  totalContributions: number;
}

export default function MentorDashboardClient({ userName }: { userName: string }) {
  const [stats, setStats] = useState<Stats>({
    pendingValidations: 0,
    validatedThisMonth: 0,
    rejectedThisMonth: 0,
    internshipsCount: 0,
    jobsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [contributionData, setContributionData] = useState<ContributionData | null>(null);
  const [contributionLoading, setContributionLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/mentor/validation-queue');
        const data = await response.json();
        
        if (data.success) {
          setStats(prev => ({
            ...prev,
            pendingValidations: data.data.pendingCount || 0,
          }));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchContributions = async () => {
      try {
        const response = await fetch('/api/activity/contributions');
        const data = await response.json();
        if (data.success) {
          setContributionData(data);
        }
      } catch (error) {
        console.error('Error fetching contributions:', error);
      } finally {
        setContributionLoading(false);
      }
    };

    fetchStats();
    fetchContributions();
  }, []);

  const statCards = [
    {
      title: 'Pending Validations',
      value: stats.pendingValidations,
      icon: '🎓',
      color: 'bg-blue-50 text-blue-600',
      href: '/mentor/validation-queue',
    },
    {
      title: 'Validated This Month',
      value: stats.validatedThisMonth,
      icon: '✅',
      color: 'bg-green-50 text-green-600',
      href: '/mentor/validation-queue',
    },
    {
      title: 'Rejected This Month',
      value: stats.rejectedThisMonth,
      icon: '❌',
      color: 'bg-red-50 text-red-600',
      href: '/mentor/validation-queue',
    },
  ];

  const quickActions = [
    {
      title: 'Review Skills',
      description: 'Validate pending skill requests',
      href: '/mentor/validation-queue',
      icon: '🎓',
    },
    {
      title: 'Add Internship',
      description: 'Post a new internship opportunity',
      href: '/mentor/internships/add',
      icon: '💼',
    },
    {
      title: 'Add Job',
      description: 'Post a new job opening',
      href: '/mentor/jobs/add',
      icon: '🏢',
    },
    {
      title: 'Notifications',
      description: 'Check your notifications',
      href: '/mentor/notifications',
      icon: '🔔',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {userName}! 👋
        </h1>
        <p className="mt-1 text-gray-600">
          Here's what's happening with your mentor activities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            href={stat.href}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="p-4 border border-gray-200 rounded-lg hover:border-[#5693C1] hover:bg-[#5693C1]/5 transition-colors group"
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="font-medium text-gray-900 group-hover:text-[#5693C1]">
                {action.title}
              </div>
              <div className="text-sm text-gray-500">{action.description}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Validation Queue Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            🎓 Skill Validation Queue
          </h2>
          <Link
            href="/mentor/validation-queue"
            className="text-[#5693C1] hover:text-[#4a7fa8] font-medium text-sm"
          >
            View All →
          </Link>
        </div>
        <p className="text-gray-600">
          You have <span className="font-semibold text-[#5693C1]">{loading ? '...' : stats.pendingValidations}</span> skills pending validation.
        </p>
        {!loading && stats.pendingValidations > 0 && (
          <Link
            href="/mentor/validation-queue"
            className="mt-4 inline-block px-4 py-2 bg-[#5693C1] text-white rounded-lg hover:bg-[#4a7fa8] transition-colors"
          >
            Start Reviewing
          </Link>
        )}
      </div>

      {/* Contribution Graph */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Activity
        </h2>
        <ContributionGraph data={contributionData} loading={contributionLoading} />
      </div>
    </div>
  );
}
