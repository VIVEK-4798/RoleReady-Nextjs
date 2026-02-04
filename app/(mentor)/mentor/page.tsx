/**
 * Mentor Dashboard Home Page
 * 
 * Overview with validation stats and quick actions.
 */

import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import MentorDashboardClient from './MentorDashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard | RoleReady Mentor',
  description: 'Mentor dashboard overview.',
};

export default async function MentorDashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || 'Mentor';

  return <MentorDashboardClient userName={userName} />;
}
