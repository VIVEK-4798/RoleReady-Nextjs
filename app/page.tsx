/**
 * Landing Page
 * 
 * Main landing page for RoleReady.
 * Migrated from Home_5 component in the old React project.
 */

import { auth } from '@/lib/auth';
import { LandingPageClient } from '@/components/home';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RoleReady',
  description: 'RoleReady - Placement Readiness. Know if you\'re ready before you apply.',
};

export default async function HomePage() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  return <LandingPageClient isAuthenticated={isAuthenticated} />;
}
