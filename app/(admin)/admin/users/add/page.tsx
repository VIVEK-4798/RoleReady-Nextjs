/**
 * Add User Page
 * 
 * Modern page for creating new user accounts with enhanced form.
 */

import { Metadata } from 'next';
import AddUserForm from './AddUserForm';

export const metadata: Metadata = {
  title: 'Add User | RoleReady Admin',
  description: 'Create a new user account with role-based permissions.',
};

export default function AddUserPage() {
  return <AddUserForm />;
}