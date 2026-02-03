/**
 * Add Job Page
 * 
 * Create new job listing.
 */

import { Metadata } from 'next';
import AddJobForm from './AddJobForm';

export const metadata: Metadata = {
  title: 'Add Job | RoleReady Admin',
  description: 'Create a new job listing.',
};

export default function AddJobPage() {
  return <AddJobForm />;
}
