/**
 * Roadmap Page (Public Route)
 * 
 * URL: /roadmap
 * 
 * This page allows authenticated users to:
 * - View their personalized skill roadmap
 * - See prioritized skills to focus on
 * - Refresh their roadmap
 * - Export to report
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import RoadmapPageClient from './RoadmapPageClient';

export const metadata = {
  title: 'Skill Roadmap | RoleReady',
  description: 'A prioritized list of skills to focus on based on your readiness analysis',
};

export default async function RoadmapPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?redirect=/roadmap');
  }

  return (
    <RoadmapPageClient userId={session.user.id} />
  );
}