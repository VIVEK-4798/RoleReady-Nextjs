/**
 * Profile Page
 * 
 * User profile management page.
 */

import { Metadata } from 'next';
import ProfileContent from './ProfileContent';

export const metadata: Metadata = {
  title: 'Profile - RoleReady',
  description: 'Manage your profile information',
};

export default function ProfilePage() {
  return <ProfileContent />;
}
