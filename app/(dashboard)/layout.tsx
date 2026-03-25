/**
 * Dashboard Layout
 *
 * Protected layout for user dashboard pages.
 * Shows navigation sidebar and header.
 */

import { ReactNode } from 'react';
import DashboardNav from './DashboardNav';
import DashboardHeader from './DashboardHeader';
import UsageAlerts from '@/components/dashboard/UsageAlerts';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <DashboardNav />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white min-h-screen lg:ml-64 min-w-0 overflow-x-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 bg-white min-w-0 w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            <UsageAlerts />
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white py-4 px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} RoleReady. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="/terms"
                className="text-sm text-gray-500 hover:text-[#5693C1] transition-colors"
              >
                Terms
              </a>
              <a
                href="/privacy"
                className="text-sm text-gray-500 hover:text-[#5693C1] transition-colors"
              >
                Privacy
              </a>
              <a
                href="/help"
                className="text-sm text-gray-500 hover:text-[#5693C1] transition-colors"
              >
                Help
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}