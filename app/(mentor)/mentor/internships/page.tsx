/**
 * Mentor Internships Page
 * 
 * List and manage internship opportunities.
 */

import { Metadata } from 'next';
import MentorInternshipsClient from './MentorInternshipsClient';

export const metadata: Metadata = {
  title: 'Internships Management | RoleReady Mentor',
  description: 'Manage your internship listings, track applications, and help students find valuable opportunities.',
};

export default function MentorInternshipsPage() {
  return (
    <div className="py-6">
      <MentorInternshipsClient />
    </div>
  );
}