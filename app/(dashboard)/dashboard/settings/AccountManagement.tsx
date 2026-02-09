// AccountManagement.tsx (Enhanced)
'use client';

import { useState } from 'react';

interface AccountInfo {
  email: string;
  memberSince: string;
  accountType: string;
  lastLogin: string;
  accountStatus: string;
}

export default function AccountManagement() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const accountInfo: AccountInfo = {
    email: 'user@example.com',
    memberSince: 'Jan 15, 2023',
    accountType: 'Premium',
    lastLogin: 'Just now',
    accountStatus: 'Active',
  };

  const handleExportData = async () => {
    setExporting(true);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setExporting(false);
    // Show success message
    console.log('Data exported');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return;
    }

    setDeleting(true);
    // Simulate delete process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setDeleting(false);
    setShowDeleteModal(false);
    // Show success message
    console.log('Account deleted');
  };

  const handleEnableTwoFactor = async () => {
    // Add 2FA enable logic
    setShowTwoFactorModal(false);
    console.log('2FA enabled with code:', twoFactorCode);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Account Management</h2>
        <p className="text-gray-600 text-sm md:text-base">
          Manage your account settings, security, and data.
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Information */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Account Information</h3>
              <p className="text-sm text-gray-600">Your account details and status</p>
            </div>
            <span className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium">
              {accountInfo.accountStatus}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Email Address" value={accountInfo.email} />
            <InfoItem label="Member Since" value={accountInfo.memberSince} />
            <InfoItem label="Account Type" value={accountInfo.accountType} badgeColor="bg-blue-100 text-[#5693C1]" />
            <InfoItem label="Last Login" value={accountInfo.lastLogin} />
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-xs text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <button
                onClick={() => setShowTwoFactorModal(true)}
                className="px-4 py-2 bg-[#5693C1] text-white rounded-lg hover:bg-[#4a80b0] transition-colors text-sm font-medium"
              >
                Enable 2FA
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Active Sessions</p>
                <p className="text-xs text-gray-600">Manage your active login sessions</p>
              </div>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                View Sessions
              </button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#5693C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Export Your Data</p>
                  <p className="text-xs text-gray-600">Download all your data in JSON format</p>
                </div>
              </div>
              <button
                onClick={handleExportData}
                disabled={exporting}
                className="px-4 py-2 bg-[#5693C1] text-white rounded-lg hover:bg-[#4a80b0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {exporting ? 'Exporting...' : 'Export Data'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-lg">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-900">Delete Account</p>
                  <p className="text-xs text-red-700">Permanently delete your account and all data</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Subscription (if applicable) */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Current Plan: Premium</p>
              <p className="text-xs text-gray-600">Renews on Jan 15, 2024</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-[#5693C1] text-white rounded-lg hover:bg-[#4a80b0] transition-colors text-sm font-medium">
                Upgrade Plan
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Factor Modal */}
      {showTwoFactorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#5693C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Enable Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Scan the QR code with your authenticator app</p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center mb-4">
              <div className="w-32 h-32 bg-gray-300 rounded flex items-center justify-center">
                <span className="text-sm text-gray-500">QR Code</span>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit code from your authenticator app:
              </label>
              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-gray-900"
                maxLength={6}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleEnableTwoFactor}
                className="flex-1 px-4 py-2 bg-[#5693C1] text-white rounded-lg hover:bg-[#4a80b0] transition-colors font-medium"
              >
                Verify & Enable
              </button>
              <button
                onClick={() => {
                  setShowTwoFactorModal(false);
                  setTwoFactorCode('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Your Account?</h3>
                <p className="text-sm text-gray-600">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-900 font-medium mb-2">You will lose:</p>
              <ul className="text-sm text-red-800 space-y-1">
                <li className="flex items-center gap-2">
                  <span>•</span>
                  <span>All your profile information</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  <span>Learning progress and achievements</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  <span>Mentor connections and messages</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span>
                  <span>All saved content and preferences</span>
                </li>
              </ul>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== 'DELETE'}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Info Item Component
function InfoItem({ label, value, badgeColor }: { 
  label: string; 
  value: string;
  badgeColor?: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {badgeColor ? (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${badgeColor}`}>
          {value}
        </span>
      ) : (
        <span className="text-sm font-medium text-gray-900">{value}</span>
      )}
    </div>
  );
}