import { Metadata } from 'next';
import AddJobForm from './AddJobForm';

export const metadata: Metadata = {
  title: 'Add Job | Mentor Dashboard',
  description: 'Create a new job listing',
};

export default function AddJobPage() {
  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add New Job</h1>
        <p className="text-gray-600 mb-6">Create a new job listing</p>
        <AddJobForm />
      </div>
    </div>
  );
}
