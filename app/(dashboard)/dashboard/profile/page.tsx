/**
 * Profile Page
 * 
 * User profile management page.
 * Faithful recreation from the old RoleReady React project.
 */

import { Metadata } from 'next';
import NewProfileContent from './NewProfileContent';

export const metadata: Metadata = {
  title: 'Profile - RoleReady',
  description: 'Manage your profile information',
};

export default function ProfilePage() {
  return <NewProfileContent />;
}
