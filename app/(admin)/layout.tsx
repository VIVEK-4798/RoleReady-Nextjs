/**
 * Admin Layout
 * 
 * Protected layout for admin pages.
 * Shows admin navigation sidebar and header.
 */

import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminNav from './AdminNav';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();

  // Check authentication
  if (!session?.user) {
    redirect('/login');
  }

  // Check admin role
  const user = session.user as { role?: string };
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar Navigation */}
      <AdminNav />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <AdminHeader />
        
        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
