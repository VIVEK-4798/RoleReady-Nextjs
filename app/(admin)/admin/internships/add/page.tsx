/**
 * Add Internship Page
 * 
 * Create new internship listing.
 */

import { Metadata } from 'next';
import AddInternshipForm from './AddInternshipForm';

export const metadata: Metadata = {
  title: 'Add Internship | RoleReady Admin',
  description: 'Create a new internship listing.',
};

export default function AddInternshipPage() {
  return <AddInternshipForm />;
}
