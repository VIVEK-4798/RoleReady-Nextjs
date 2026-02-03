/**
 * Admin Internships Page
 * 
 * Manage internship listings.
 */

import { Metadata } from 'next';
import AdminInternshipsClient from './AdminInternshipsClient';

export const metadata: Metadata = {
  title: 'Internships | RoleReady Admin',
  description: 'Manage internship listings.',
};

export default function AdminInternshipsPage() {
  return <AdminInternshipsClient />;
}
