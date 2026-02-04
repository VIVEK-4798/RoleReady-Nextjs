/**
 * Add Internship Page
 * 
 * Form to create a new internship.
 */

import { Metadata } from 'next';
import AddInternshipForm from './AddInternshipForm';

export const metadata: Metadata = {
  title: 'Add Internship | RoleReady Mentor',
  description: 'Add a new internship listing.',
};

export default function AddInternshipPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Internship</h1>
        <p className="mt-1 text-gray-600">
          Create a new internship opportunity
        </p>
      </div>
      <AddInternshipForm />
    </div>
  );
}
