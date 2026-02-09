// PrivacySettings.tsx (Enhanced)
'use client';

import { useState } from 'react';

interface PrivacySettingsState {
  profileVisibility: 'public' | 'private' | 'connections';
  showEmail: boolean;
  showPhone: boolean;
  showSkills: boolean;
  showProgress: boolean;
  showAchievements: boolean;
  allowMentorRequests: boolean;
  showInSearch: boolean;
  dataSharing: boolean;
  analyticsSharing: boolean;
}

export default function PrivacySettings() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PrivacySettingsState>({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showSkills: true,
    showProgress: true,
    showAchievements: true,
    allowMentorRequests: true,
    showInSearch: true,
    dataSharing: false,
    analyticsSharing: true,
  });

  const handleSave = async () => {
    setSaving(true);
    // Add API call here
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    // Show success message
  };

  const getVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'Your profile is visible to everyone on RoleReady';
      case 'connections':
        return 'Only your connections can see your profile';
      case 'private':
        return 'Your profile is hidden from everyone';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Privacy Settings</h2>
        <p className="text-gray-600 text-sm md:text-base">
          Control who can see your information and how your data is used.
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Visibility */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#5693C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Profile Visibility</h3>
              <p className="text-sm text-gray-600">{getVisibilityDescription(settings.profileVisibility)}</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { value: 'public', label: 'Public', description: 'Anyone can view your profile' },
              { value: 'connections', label: 'Connections Only', description: 'Only your connections and mentors' },
              { value: 'private', label: 'Private', description: 'Only you can view your profile' },
            ].map((option) => (
              <label key={option.value} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  checked={settings.profileVisibility === option.value}
                  onChange={() => setSettings({ ...settings, profileVisibility: option.value as any })}
                  className="mt-1 w-4 h-4 text-[#5693C1] focus:ring-[#5693C1]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{option.label}</span>
                    {settings.profileVisibility === option.value && (
                      <span className="text-xs text-[#5693C1] bg-blue-50 px-2 py-1 rounded-full">Current</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
          <div className="space-y-4">
            {[
              { key: 'showEmail', label: 'Show Email Address', description: 'Display your email on your profile' },
              { key: 'showPhone', label: 'Show Phone Number', description: 'Display your phone number on your profile' },
              { key: 'showSkills', label: 'Show Skills', description: 'Display your skills and expertise' },
              { key: 'showProgress', label: 'Show Learning Progress', description: 'Show your course and skill progress' },
              { key: 'showAchievements', label: 'Show Achievements', description: 'Display your badges and achievements' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>
                <ToggleSwitch
                  enabled={settings[item.key as keyof PrivacySettingsState] as boolean}
                  onChange={() => setSettings({ ...settings, [item.key]: !settings[item.key as keyof PrivacySettingsState] })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Discoverability */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Discoverability</h3>
          <div className="space-y-4">
            {[
              { key: 'showInSearch', label: 'Show in Search Results', description: 'Allow others to find you through search' },
              { key: 'allowMentorRequests', label: 'Allow Mentor Requests', description: 'Let mentors send you connection requests' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>
                <ToggleSwitch
                  enabled={settings[item.key as keyof PrivacySettingsState] as boolean}
                  onChange={() => setSettings({ ...settings, [item.key]: !settings[item.key as keyof PrivacySettingsState] })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Data Sharing */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data & Analytics</h3>
          <div className="space-y-4">
            {[
              { 
                key: 'dataSharing', 
                label: 'Share Data with Partners', 
                description: 'Allow anonymous data sharing with trusted partners for research',
                important: true
              },
              { 
                key: 'analyticsSharing', 
                label: 'Usage Analytics', 
                description: 'Help us improve RoleReady by sharing anonymous usage data'
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    {item.important && (
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">Important</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>
                <ToggleSwitch
                  enabled={settings[item.key as keyof PrivacySettingsState] as boolean}
                  onChange={() => setSettings({ ...settings, [item.key]: !settings[item.key as keyof PrivacySettingsState] })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#5693C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Your Privacy Matters</h4>
              <p className="text-sm text-gray-600 mb-3">
                We take your privacy seriously. Your data is encrypted and stored securely. 
                We never share personally identifiable information without your explicit consent.
              </p>
              <a 
                href="#" 
                className="text-sm text-[#5693C1] hover:underline font-medium inline-flex items-center gap-1"
              >
                Read our Privacy Policy
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-[#5693C1] text-white rounded-lg hover:bg-[#4a80b0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Privacy Settings'
            )}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable Toggle Switch Component
function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:ring-offset-2 ${
        enabled ? 'bg-[#5693C1]' : 'bg-gray-300'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}