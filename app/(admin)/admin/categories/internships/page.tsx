/**
 * Admin Internship Categories Page
 * 
 * Manage internship categories.
 */

import { Metadata } from 'next';
import AdminInternshipCategoriesClient from './AdminInternshipCategoriesClient';

export const metadata: Metadata = {
  title: 'Internship Categories | RoleReady Admin',
  description: 'Manage internship categories.',
};

export default function AdminInternshipCategoriesPage() {
  return <AdminInternshipCategoriesClient />;
}
