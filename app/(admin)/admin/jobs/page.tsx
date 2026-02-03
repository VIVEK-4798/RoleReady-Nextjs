/**
 * Admin Jobs Page
 * 
 * Manage job listings.
 */

import { Metadata } from 'next';
import AdminJobsClient from './AdminJobsClient';

export const metadata: Metadata = {
  title: 'Jobs | RoleReady Admin',
  description: 'Manage job listings.',
};

export default function AdminJobsPage() {
  return <AdminJobsClient />;
}
