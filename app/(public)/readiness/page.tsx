/**
 * Skills Page (Public Route)
 * 
 * URL: /dashboard/skills
 * 
 * This page allows authenticated users to:
 * - View all their skills
 * - Add new skills
 * - Delete skills
 * - See skill verification status
 * - Filter and search skills
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import SkillsPageClient from './ReadinessPageClient';

export const metadata = {
  title: 'My Skills | RoleReady',
  description: 'Manage and track your professional skills',
};

export default async function SkillsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?redirect=/dashboard/skills');
  }

  return (
    <SkillsPageClient userId={session.user.id} />
  );
}