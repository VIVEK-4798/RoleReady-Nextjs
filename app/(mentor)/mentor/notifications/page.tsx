/**
 * Mentor Notifications Page
 * 
 * Display and manage mentor notifications
 */

import { Metadata } from 'next';
import MentorNotificationsClient from './MentorNotificationsClient';

export const metadata: Metadata = {
  title: 'Notifications | RoleReady Mentor',
  description: 'View and manage your mentor notifications for student activities, system alerts, and important updates.',
};

export default function MentorNotificationsPage() {
  return (
    <div className="py-6">
      <MentorNotificationsClient />
    </div>
  );
}