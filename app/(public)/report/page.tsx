/**
 * Report Page (Public Route)
 * 
 * URL: /report
 * 
 * This page allows authenticated users to:
 * - View their readiness report
 * - Print the report
 * - Export to PDF
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import ReportPageClient from './ReportPageClient';
import LandingHeader from '@/components/home/LandingHeader';
import FooterSection from '@/components/home/FooterSection';

export const metadata = {
  title: 'Readiness Report | RoleReady',
  description: 'Your defensible proof of skill readiness',
};

export default async function ReportPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login?redirect=/report');
  }
  
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader isAuthenticated={true} />
      <main className="pt-20"> {/* Adjust based on your header height */}
        <ReportPageClient userId={session.user.id} userName={session.user.name || 'User'} />
      </main>
      <FooterSection />
    </div>
  );
}