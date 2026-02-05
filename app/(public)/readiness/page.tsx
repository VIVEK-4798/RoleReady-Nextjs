/**
 * Readiness Page (Public Route)
 * 
 * URL: /readiness
 * 
 * This page allows authenticated users to:
 * - View their readiness evaluation context
 * - See their current readiness score
 * - Calculate/recalculate their readiness
 * - View skill breakdown
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import ReadinessPageClient from './ReadinessPageClient';
import LandingHeader from '@/components/home/LandingHeader';
import FooterSection from '@/components/home/FooterSection';

export const metadata = {
  title: 'Readiness Evaluation | RoleReady',
  description: 'Evaluate your skills against industry benchmarks for your target role',
};

export default async function ReadinessPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login?redirect=/readiness');
  }
  
  return (
    <>
      <LandingHeader isAuthenticated={true} />
      <ReadinessPageClient userId={session.user.id} />
      <FooterSection />
    </>
  );
}
