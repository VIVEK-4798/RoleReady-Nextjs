/**
 * Mentor Dashboard Home Page
 * 
 * Overview with validation stats and quick actions.
 */

import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import MentorDashboardClient from './MentorDashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard | RoleReady Mentor',
  description: 'Mentor dashboard overview with statistics, quick actions, and performance metrics.',
};

export default async function MentorDashboardPage() {
  const session = await auth();

  // Get user details from session
  const userName = session?.user?.name?.split(' ')[0] || 'Mentor';
  const userEmail = session?.user?.email || 'mentor@roleready.com';
  const userId = session?.user?.id;

  // Import service dynamically to avoid build-time issues with auth
  const { getMentorValidationStats } = await import('@/lib/services/mentorQueueService');
  const { getMentorWorkload } = await import('@/lib/services/mentorAssignmentService');

  let stats = { pending: 0, validated: 0, rejected: 0, total: 0 };
  let workload = { assignedUsersCount: 0, pendingValidationsCount: 0 };

  if (userId) {
    [stats, workload] = await Promise.all([
      getMentorValidationStats(userId),
      getMentorWorkload(userId)
    ]);
  }

  return (
    <div>
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#5693C1] to-[#4a80b0] flex items-center justify-center text-white font-bold text-xl">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {userName}!
                </h1>
                <p className="text-gray-600">{userEmail}</p>
              </div>
            </div>
            <p className="text-gray-500 mt-2">
              Last login: Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-[#5693C1] hover:bg-[#4a80b0] text-white font-medium rounded-lg transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Task
            </button>
            <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="mt-6 p-4 bg-gradient-to-r from-[#5693C1]/10 to-[#4a80b0]/10 rounded-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#5693C1]"></div>
              <span className="text-sm text-gray-700">You have {stats.pending} pending validations this week</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-[#5693C1]">{stats.validated}</span> validated total
              </span>
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-[#5693C1]">{workload.assignedUsersCount}</span> active students
              </span>
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-[#5693C1]">94%</span> satisfaction rate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <MentorDashboardClient userName={userName} />

      {/* Bottom Stats */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-[#5693C1]">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Skills Processed</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-green-600">{stats.validated}</div>
            <div className="text-sm text-gray-600">Successful Validations</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected Skills</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-purple-600">{workload.assignedUsersCount}</div>
            <div className="text-sm text-gray-600">Assigned Students</div>
          </div>
        </div>
      </div>
    </div>
  );
}