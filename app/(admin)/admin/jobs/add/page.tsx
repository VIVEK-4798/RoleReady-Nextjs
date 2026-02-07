/**
 * Add Job Page
 * 
 * Modern page for creating new job listings with multi-step form.
 */

import { Metadata } from 'next';
import AddJobForm from './AddJobForm';

export const metadata: Metadata = {
  title: 'Add Job | RoleReady Admin',
  description: 'Create new job listing with our multi-step form.',
};

export default function AddJobPage() {
  return <AddJobForm />;
}