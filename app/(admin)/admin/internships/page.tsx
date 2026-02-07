import { Metadata } from 'next';
import AdminInternshipsClient from './AdminInternshipsClient';

export const metadata: Metadata = {
  title: 'Internships | RoleReady Admin',
  description: 'Manage internship listings with advanced filtering and bulk actions.',
};

export default function AdminInternshipsPage() {
  return <AdminInternshipsClient />;
}