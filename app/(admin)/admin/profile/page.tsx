/**
 * Admin Profile Page
 * 
 * Modern profile management page with enhanced design and security features.
 */

import { Metadata } from 'next';
import AdminProfileClient from './AdminProfileClient';

export const metadata: Metadata = {
  title: 'Profile | RoleReady Admin',
  description: 'Manage your profile information, security settings, and account activity.',
};

export default function AdminProfilePage() {
  return <AdminProfileClient />;
}