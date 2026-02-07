/**
 * Admin Benchmarks Page
 * 
 * Configure role skill benchmarks and requirements.
 * Migrated from old project: pages/dashboard/admin-dashboard/add-benchmarks
 */

import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Benchmarks | RoleReady Admin',
  description: 'Configure role skill benchmarks and requirements.',
};

export default function AdminBenchmarksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Benchmarks Configuration</h1>
        <p className="mt-1 text-gray-600">
          Configure skill benchmarks and requirements for each role.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          💡 <strong>Note:</strong> Benchmark configuration is done per role. 
          Please go to the{' '}
          <Link 
            href="/admin/roles" 
            className="text-[#5693C1] underline hover:text-[#4a80b0] font-medium"
          >
            Roles page
          </Link>
          {' '}and select a role to configure its benchmarks.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/roles"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
          >
            <div className="p-2 bg-blue-50 rounded-lg text-[#5693C1] group-hover:bg-blue-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Manage Roles</p>
              <p className="text-sm text-gray-500">View and edit all job roles</p>
            </div>
          </Link>

          <Link
            href="/admin/skills"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
          >
            <div className="p-2 bg-blue-50 rounded-lg text-[#5693C1] group-hover:bg-blue-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Manage Skills</p>
              <p className="text-sm text-gray-500">View and edit all skills</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              No recent benchmark updates
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Statistics</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total Roles with Benchmarks</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Skills per Role</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}