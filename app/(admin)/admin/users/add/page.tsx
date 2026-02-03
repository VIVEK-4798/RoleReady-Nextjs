/**
 * Add User Page
 * 
 * Form to create a new user.
 * Migrated from old project: pages/dashboard/admin-dashboard/add-user
 */

import { Metadata } from 'next';
import AddUserForm from './AddUserForm';

export const metadata: Metadata = {
  title: 'Add User | RoleReady Admin',
  description: 'Create a new user account.',
};

export default function AddUserPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
        <p className="mt-1 text-gray-600">Create a new user account for the platform.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <AddUserForm />
      </div>
    </div>
  );
}
