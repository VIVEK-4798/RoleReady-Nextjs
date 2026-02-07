/**
 * Admin Internship Categories Page
 * 
 * Modern page for managing internship categories with enhanced design.
 */

import { Metadata } from 'next';
import AdminInternshipCategoriesClient from './AdminInternshipCategoriesClient';

export const metadata: Metadata = {
  title: 'Internship Categories | RoleReady Admin',
  description: 'Organize and manage internship listings with color-coded categories.',
};

export default function AdminInternshipCategoriesPage() {
  return <AdminInternshipCategoriesClient />;
}