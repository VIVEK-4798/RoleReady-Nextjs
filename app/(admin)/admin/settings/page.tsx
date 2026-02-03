/**
 * Admin Settings Page
 * 
 * Platform settings and configuration.
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | RoleReady Admin',
  description: 'Platform settings and configuration.',
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">
          Configure platform settings and preferences.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Settings configuration coming soon...</p>
      </div>
    </div>
  );
}
