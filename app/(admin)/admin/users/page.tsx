/**
 * Admin Users Page
 * 
 * Modern user management page with enhanced design and analytics.
 */

import { Metadata } from 'next';
import AdminUsersClient from './AdminUsersClient';

export const metadata: Metadata = {
  title: 'User Management | RoleReady Admin',
  description: 'Manage user accounts with advanced filtering, analytics, and bulk actions.',
};

export default function AdminUsersPage() {
  return <AdminUsersClient />;
}