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
    <div className="min-h-screen bg-white flex">
      {/* Sidebar Navigation */}
      <AdminNav />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
        {/* Sticky Header */}
        <AdminHeader />
        
        {/* Page Content with subtle gradient background */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-gradient-to-b from-gray-50/50 to-white">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}