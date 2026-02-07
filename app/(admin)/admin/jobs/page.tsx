/**
 * Admin Jobs Page
 * 
 * Modern job management page with enhanced design and analytics.
 */

import { Metadata } from 'next';
import AdminJobsClient from './AdminJobsClient';

export const metadata: Metadata = {
  title: 'Jobs | RoleReady Admin',
  description: 'Manage job listings with advanced filtering, analytics, and bulk actions.',
};

export default function AdminJobsPage() {
  return <AdminJobsClient />;
}