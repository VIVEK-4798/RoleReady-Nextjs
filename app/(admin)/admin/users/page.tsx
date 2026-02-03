/**
 * Admin Users Page
 * 
 * Lists all users with search, filter, and actions.
 * Migrated from old project: pages/dashboard/admin-dashboard/users/index.jsx
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import AdminUsersClient from './AdminUsersClient';

export const metadata: Metadata = {
  title: 'Users | RoleReady Admin',
  description: 'Manage all platform users.',
};

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading users...</div>}>
      <AdminUsersClient />
    </Suspense>
  );
}
