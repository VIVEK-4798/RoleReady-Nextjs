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
    <ReportPageClient userId={session.user.id} userName={session.user.name || 'User'} />
  );
}