/**
 * Admin Profile Page
 * 
 * Modern profile management with enhanced design and security features.
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ProfileData {
  name: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
  mobile?: string;
  department?: string;
  avatar?: string;
}

interface Activity {
  id: string;
  action: string;
  description: string;
  time: string;
  ip?: string;
}

export default function AdminProfileClient() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity'>('profile');
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  
  // Profile edit form
  const [editForm, setEditForm] = useState({
    name: '',
    mobile: '',
    department: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Two-factor authentication
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        
        if (data.success) {
          setProfile(data.data);
          setEditForm({
            name: data.data.name || '',
            mobile: data.data.mobile || '',
            department: data.data.department || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      // Use session data as fallback
      setProfile({
        name: session.user.name || 'N/A',
        email: session.user.email || 'N/A',
        role: (session.user as any).role || 'admin',
        createdAt: new Date().toISOString(),
      });
      setEditForm({
        name: session.user.name || '',
        mobile: '',
        department: '',
      });
      setLoading(false);
    } else {
      fetchProfile();
    }
  }, [session]);

  // Fetch recent activity
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch('/api/profile/activity');
        const data = await response.json();
        
        if (data.success) {
          setRecentActivity(data.data.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching activity:', error);
      }
    };

    fetchActivity();
  }, []);

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    setEditLoading(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (data.success) {
        setEditSuccess(data.message);
        // Update profile state
        if (profile) {
          setProfile({
            ...profile,
            name: editForm.name,
            mobile: editForm.mobile,
            department: editForm.department,
          });
        }
        // Auto-hide success message
        setTimeout(() => setEditSuccess(''), 3000);
      } else {
        setEditError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setEditError('An error occurred. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordLoading(true);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
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
        // Auto-hide success message
        setTimeout(() => setPasswordSuccess(''), 3000);
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

  // Handle two-factor toggle
  const handleTwoFactorToggle = async () => {
    setTwoFactorLoading(true);
    try {
      const response = await fetch('/api/profile/two-factor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !twoFactorEnabled }),
      });

      const data = await response.json();
      
      if (data.success) {
        setTwoFactorEnabled(!twoFactorEnabled);
      } else {
        console.error('Failed to toggle 2FA:', data.error);
      }
    } catch (error) {
      console.error('2FA toggle error:', error);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // Generate avatar initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#5693C1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-[#5693C1]/10 to-blue-400/10 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="mt-2 text-gray-600">
              Manage your account information, security settings, and activity
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'text-[#5693C1] border-b-2 border-[#5693C1]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'security'
                      ? 'text-[#5693C1] border-b-2 border-[#5693C1]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Security
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === 'activity'
                      ? 'text-[#5693C1] border-b-2 border-[#5693C1]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Recent Activity
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Profile Information Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Avatar Section */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#5693C1] to-blue-400 flex items-center justify-center text-white text-2xl font-bold">
                          {getInitials(profile?.name || 'Admin')}
                        </div>
                        <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">Click to change photo</p>
                    </div>

                    {/* Profile Form */}
                    <div className="flex-1">
                      <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-gray-900 placeholder-gray-500"
                              placeholder="Enter your full name"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={profile?.email || ''}
                              disabled
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500">Contact support to change email</p>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
                              Mobile Number
                            </label>
                            <input
                              type="tel"
                              value={editForm.mobile}
                              onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-gray-900 placeholder-gray-500"
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
                              Department
                            </label>
                            <input
                              type="text"
                              value={editForm.department}
                              onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-gray-900 placeholder-gray-500"
                              placeholder="e.g., Administration"
                            />
                          </div>
                        </div>

                        {/* Messages */}
                        {editError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-start gap-2">
                            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {editError}
                          </div>
                        )}

                        {editSuccess && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm flex items-start gap-2">
                            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {editSuccess}
                          </div>
                        )}

                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={editLoading}
                            className="px-6 py-3 bg-gradient-to-r from-[#5693C1] to-blue-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {editLoading ? (
                              <span className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Updating...
                              </span>
                            ) : (
                              'Update Profile'
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  {/* Change Password Form */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">
                            Current Password *
                          </label>
                          <input
                            type="password"
                            required
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="Enter current password"
                            disabled={passwordLoading}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">
                            New Password *
                          </label>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="At least 6 characters"
                            disabled={passwordLoading}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">
                            Confirm New Password *
                          </label>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="Confirm new password"
                            disabled={passwordLoading}
                          />
                        </div>
                      </div>

                      {/* Password Requirements */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Password Requirements</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li className="flex items-center gap-2">
                            <svg className={`w-4 h-4 ${passwordForm.newPassword.length >= 6 ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                              {passwordForm.newPassword.length >= 6 ? (
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              ) : (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              )}
                            </svg>
                            Minimum 6 characters
                          </li>
                          <li className="flex items-center gap-2">
                            <svg className={`w-4 h-4 ${/[A-Z]/.test(passwordForm.newPassword) ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                              {/[A-Z]/.test(passwordForm.newPassword) ? (
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              ) : (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              )}
                            </svg>
                            At least one uppercase letter
                          </li>
                          <li className="flex items-center gap-2">
                            <svg className={`w-4 h-4 ${/[0-9]/.test(passwordForm.newPassword) ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                              {/[0-9]/.test(passwordForm.newPassword) ? (
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              ) : (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              )}
                            </svg>
                            At least one number
                          </li>
                        </ul>
                      </div>

                      {/* Messages */}
                      {passwordError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-start gap-2">
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {passwordError}
                        </div>
                      )}

                      {passwordSuccess && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm flex items-start gap-2">
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {passwordSuccess}
                        </div>
                      )}

                      <div>
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="px-6 py-3 bg-gradient-to-r from-[#5693C1] to-blue-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {passwordLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Changing Password...
                            </span>
                          ) : (
                            'Update Password'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-600">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button
                        onClick={handleTwoFactorToggle}
                        disabled={twoFactorLoading}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          twoFactorEnabled ? 'bg-[#5693C1]' : 'bg-gray-300'
                        } ${twoFactorLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    {twoFactorEnabled && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-blue-900">2FA is enabled</p>
                            <p className="text-sm text-blue-700 mt-1">
                              You'll be asked for a verification code when signing in from new devices.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recent Activity Tab */}
              {activeTab === 'activity' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                              <span className="text-xs text-gray-500">{activity.time}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            {activity.ip && (
                              <p className="text-xs text-gray-500 mt-1">IP: {activity.ip}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">No recent activity found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Profile Summary */}
        <div className="space-y-6">
          {/* Profile Summary Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#5693C1] to-blue-400 flex items-center justify-center text-white font-semibold">
                  {getInitials(profile?.name || 'Admin')}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{profile?.name}</p>
                  <p className="text-sm text-gray-500">{profile?.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="font-medium text-gray-900 capitalize">{profile?.role}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Login</p>
                  <p className="font-medium text-gray-900">
                    {profile?.lastLogin
                      ? new Date(profile.lastLogin).toLocaleDateString()
                      : 'Today'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Status Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className={`w-5 h-5 ${twoFactorEnabled ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    {twoFactorEnabled ? (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    )}
                  </svg>
                  <span className="text-sm font-medium text-gray-900">2FA Authentication</span>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Strong Password</span>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Email Verified</span>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 px-4 py-3 text-left rounded-xl hover:bg-gray-50 transition-colors text-gray-700">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Public Profile
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-3 text-left rounded-xl hover:bg-gray-50 transition-colors text-gray-700">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Manage Sessions
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-3 text-left rounded-xl hover:bg-gray-50 transition-colors text-gray-700">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Privacy Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}