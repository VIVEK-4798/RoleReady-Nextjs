/**
 * Mentor Internships Page
 * 
 * List and manage internships.
 */

import { Metadata } from 'next';
import MentorInternshipsClient from './MentorInternshipsClient';

export const metadata: Metadata = {
  title: 'Internships | RoleReady Mentor',
  description: 'Manage internship listings.',
};

export default function MentorInternshipsPage() {
  return <MentorInternshipsClient />;
}
