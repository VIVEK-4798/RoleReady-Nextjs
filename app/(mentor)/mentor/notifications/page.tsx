import { Metadata } from 'next';
import MentorNotificationsClient from './MentorNotificationsClient';

export const metadata: Metadata = {
  title: 'Notifications | Mentor Dashboard',
  description: 'View your mentor notifications',
};

export default function MentorNotificationsPage() {
  return <MentorNotificationsClient />;
}
