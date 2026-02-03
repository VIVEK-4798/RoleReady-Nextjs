/**
 * Mentor Profile Page
 * 
 * Manage profile information and change password.
 */

import { Metadata } from 'next';
import MentorProfileClient from './MentorProfileClient';

export const metadata: Metadata = {
  title: 'Profile | RoleReady Mentor',
  description: 'Manage your profile and security settings.',
};

export default function MentorProfilePage() {
  return <MentorProfileClient />;
}
