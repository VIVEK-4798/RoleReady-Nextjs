/**
 * Mentor Dashboard Layout
 * 
 * Protected layout for mentor routes with role-based access control.
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import MentorNav from './MentorNav';
import MentorHeader from './MentorHeader';

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Role check
  const userRole = (session.user as { role?: string }).role;

  // For mentors and admins, render full mentor layout
  if (userRole !== 'mentor' && userRole !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-white">
      <MentorNav />
      <main className="lg:pl-64">
        <MentorHeader
          userName={session.user.name || undefined}
          userEmail={session.user.email || undefined}
        />
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}