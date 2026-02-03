/**
 * Admin Profile Page
 * 
 * Manage profile information and change password.
 */

import { Metadata } from 'next';
import AdminProfileClient from './AdminProfileClient';

export const metadata: Metadata = {
  title: 'Profile | RoleReady Admin',
  description: 'Manage your profile and security settings.',
};

export default function AdminProfilePage() {
  return <AdminProfileClient />;
}
