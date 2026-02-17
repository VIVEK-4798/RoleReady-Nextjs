/**
 * Mentor Dashboard Client Component
 * 
 * Shows overview stats and quick actions for mentor.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import VerifiedMentorBadge from '@/components/mentor/VerifiedMentorBadge';
import MentorImpactMetrics from '@/components/mentor/MentorImpactMetrics';
import ValidationWorkflowCard from '@/components/mentor/ValidationWorkflowCard';
import PostOpportunityCard from '@/components/mentor/PostOpportunityCard';

interface Stats {
  pendingValidations: number;
  validatedToday: number;
  totalValidations: number;
  internshipsCount: number;
  jobsCount: number;
  activeStudents: number;
  completionRate: number;
  avgResponseTime: string;
  satisfaction: string;
}

interface RecentActivity {
  id: string;
  studentName: string;
  skill: string;
  action: 'validated' | 'rejected';
  time: string;
}

export default function MentorDashboardClient({ userName }: { userName: string }) {
  const [stats, setStats] = useState<Stats>({
    pendingValidations: 0,
    validatedToday: 0,
    totalValidations: 0,
    internshipsCount: 0,
    jobsCount: 0,
    activeStudents: 0,
    completionRate: 100,
    avgResponseTime: '0h',
    satisfaction: '5.0',
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/mentor/dashboard');
        const result = await response.json();

        if (result.success) {
          setStats(result.data.stats);
          setRecentActivities(result.data.recentActivity);
          setPendingTasks(result.data.pendingTasks);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Pending Validations',
      value: stats.pendingValidations,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-50 text-yellow-600',
      borderColor: 'border-yellow-200',
      href: '/mentor/validations',
    },
    {
      title: 'Validated Today',
      value: stats.validatedToday,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      color: 'bg-green-50 text-green-600',
      borderColor: 'border-green-200',
      href: '/mentor/validations',
    },
    {
      title: 'Active Students',
      value: stats.activeStudents,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-6.197a6 6 0 00-9 5.197" />
        </svg>
      ),
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-200',
      href: '/mentor/validations',
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'bg-purple-50 text-purple-600',
      borderColor: 'border-purple-200',
      href: '/mentor/validations',
    },
  ];

  const quickActions = [
    {
      title: 'Review Skills',
      description: 'Validate pending skill requests from students',
      href: '/mentor/validations',
      icon: '🎓',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      title: 'Add Internship',
      description: 'Post a new internship opportunity',
      href: '/mentor/internships',
      icon: '💼',
      color: 'bg-green-50 border-green-200',
    },
    {
      title: 'Add Job',
      description: 'Post a new job opening',
      href: '/mentor/jobs',
      icon: '🏢',
      color: 'bg-purple-50 border-purple-200',
    },
    {
      title: 'My Profile',
      description: 'Update your mentoring preferences',
      href: '/mentor/profile',
      icon: '👤',
      color: 'bg-yellow-50 border-yellow-200',
    },
  ];


  return (
    <div className="space-y-6">
      {/* Header with Verified Badge */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, <span className="text-[#5693C1]">{userName}</span>!
          </h1>
          <p className="mt-2 text-gray-600">
            Here&apos;s what&apos;s happening with your mentor dashboard today.
          </p>
        </div>
        <VerifiedMentorBadge variant="default" />
      </div>

      {/* Impact Metrics - Feature 2 */}
      {!loading && (
        <MentorImpactMetrics stats={stats} />
      )}

      {/* Validation Workflow & Post Opportunity - Features 3 & 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ValidationWorkflowCard pendingCount={stats.pendingValidations} />
        <PostOpportunityCard
          jobsCount={stats.jobsCount}
          internshipsCount={stats.internshipsCount}
        />
      </div>

      {/* Quick Actions & Pending Tasks Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <span className="text-sm text-gray-500">4 available actions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className={`p-4 rounded-xl border ${action.color} hover:shadow-md transition-all duration-200 hover:scale-[1.02]`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{action.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Click to proceed</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Pending Tasks</h2>
            <span className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium">
              {pendingTasks.length} pending
            </span>
          </div>

          <div className="space-y-4">
            {pendingTasks.map((task) => (
              <div key={task.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">Student: {task.student}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${task.time === 'Due today' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {task.time}
                  </span>
                </div>
                <button className="mt-3 w-full py-2 bg-[#5693C1] hover:bg-[#4a80b0] text-white text-sm font-medium rounded-lg transition-colors">
                  Start Review
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <Link href="/mentor/activity" className="text-sm text-[#5693C1] hover:text-[#4a80b0] font-medium">
              View all →
            </Link>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.action === 'validated' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {activity.action === 'validated' ? '✓' : '✗'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {activity.studentName}&apos;s {activity.skill} skill
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.action === 'validated' ? 'Validated' : 'Rejected'} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Summary</h2>

          <div className="space-y-6">
            {/* Validation Stats */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Completion Progress</span>
                <span className="text-sm font-bold text-gray-900">{stats.completionRate}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${stats.completionRate}%` }}></div>
              </div>
            </div>

            {/* Response Time */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Avg Response Time</span>
                <span className="text-sm font-bold text-gray-900">{stats.avgResponseTime}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            {/* Student Satisfaction */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Student Satisfaction</span>
                <span className="text-sm font-bold text-gray-900">{stats.satisfaction}/5</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{stats.totalValidations}</div>
                <div className="text-sm text-gray-600">Total Validations</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{stats.internshipsCount}</div>
                <div className="text-sm text-gray-600">Active Internships</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Features</h2>
          {/* <Link href="/mentor/calendar" className="text-sm text-[#5693C1] hover:text-[#4a80b0] font-medium">
            View calendar →
          </Link> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Skill Validation Workshop', date: 'Tomorrow, 2:00 PM', type: 'workshop' },
            { title: 'Student Mentoring Session', date: 'Friday, 10:00 AM', type: 'mentoring' },
            { title: 'Career Fair Preparation', date: 'Next Monday, 3:00 PM', type: 'event' },
          ].map((event, index) => (
            <div key={index} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${event.type === 'workshop' ? 'bg-blue-100 text-blue-600' : event.type === 'mentoring' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                  {event.type === 'workshop' ? '📚' : event.type === 'mentoring' ? '👥' : '🎯'}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{event.date}</p>
                </div>
              </div>
              <button className="mt-3 w-full py-2 border border-[#5693C1] text-[#5693C1] hover:bg-[#5693C1] hover:text-white text-sm font-medium rounded-lg transition-colors">
                Add to Calendar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}