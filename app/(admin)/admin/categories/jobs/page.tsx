/**
 * Admin Job Categories Page
 * 
 * Modern page for managing job categories with enhanced design.
 */

import { Metadata } from 'next';
import AdminJobCategoriesClient from './AdminJobCategoriesClient';

export const metadata: Metadata = {
  title: 'Job Categories | RoleReady Admin',
  description: 'Organize and manage job listings with color-coded categories.',
};

export default function AdminJobCategoriesPage() {
  return <AdminJobCategoriesClient />;
}