/**
 * Admin Job Categories Page
 * 
 * Manage job categories.
 */

import { Metadata } from 'next';
import AdminJobCategoriesClient from './AdminJobCategoriesClient';

export const metadata: Metadata = {
  title: 'Job Categories | RoleReady Admin',
  description: 'Manage job categories.',
};

export default function AdminJobCategoriesPage() {
  return <AdminJobCategoriesClient />;
}
