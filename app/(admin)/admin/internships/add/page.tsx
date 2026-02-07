import { Metadata } from 'next';
import AddInternshipForm from './AddInternshipForm';

export const metadata: Metadata = {
  title: 'Add Internship | RoleReady Admin',
  description: 'Create new internship listing with our multi-step form.',
};

export default function AddInternshipPage() {
  return <AddInternshipForm />;
}