/**
 * Password Change Section Component
 * 
 * Secure password change functionality for user profile.
 */

'use client';

import { useState } from 'react';

export default function PasswordChangeSection() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordLoading(true);

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json();

      if (data.success) {
        setPasswordSuccess(data.message);
        // Clear form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        // Auto-collapse after success
        setTimeout(() => {
          setShowPasswordSection(false);
          setPasswordSuccess('');
        }, 3000);
      } else {
        setPasswordError(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordError('An error occurred. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setShowPasswordSection(!showPasswordSection)}
        className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">
              Change Password
            </h3>
            <p className="text-sm text-gray-500">
              Update your account security
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            showPasswordSection ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Password Form (Expandable) */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          showPasswordSection ? 'max-h-150' : 'max-h-0'
        }`}
      >
        <div className="px-4 sm:px-6 pb-6 border-t border-gray-100 pt-4">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter current password"
                disabled={passwordLoading}
                style={{ color: '#000000' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new password (min 6 characters)"
                disabled={passwordLoading}
                style={{ color: '#000000' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm new password"
                disabled={passwordLoading}
                style={{ color: '#000000' }}
              />
            </div>

            {/* Error Message */}
            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {passwordError}
              </div>
            )}

            {/* Success Message */}
            {passwordSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                {passwordSuccess}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-70 font-medium flex-1"
                style={{ backgroundColor: '#5693C1' }}
              >
                {passwordLoading ? 'Changing Password...' : 'Change Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordSection(false);
                  setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                  setPasswordError('');
                  setPasswordSuccess('');
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}