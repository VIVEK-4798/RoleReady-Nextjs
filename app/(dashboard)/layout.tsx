/**
 * Dashboard Layout
 *
 * Protected layout for user dashboard pages.
 * Shows navigation sidebar and header.
 */

import { ReactNode } from 'react';
import DashboardNav from './DashboardNav';
import DashboardHeader from './DashboardHeader';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar Navigation */}
      <DashboardNav />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64 bg-white">
        {/* Header */}
        <DashboardHeader />

        {/* Page Content */}
        <main className="flex-1 p-6 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
