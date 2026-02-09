// EmailPreferences.tsx (Enhanced)
'use client';

import { useState } from 'react';

interface EmailPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  category: 'essential' | 'recommended' | 'optional';
}

export default function EmailPreferences() {
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<EmailPreference[]>([
    {
      id: 'marketing',
      label: 'Marketing Emails',
      description: 'Receive emails about new features, updates, and promotions.',
      enabled: true,
      category: 'optional',
    },
    {
      id: 'notifications',
      label: 'Notification Emails',
      description: 'Receive notifications about your account activity and important updates.',
      enabled: true,
      category: 'essential',
    },
    {
      id: 'weekly_digest',
      label: 'Weekly Digest',
      description: 'Get a weekly summary of your activity and trending content.',
      enabled: false,
      category: 'recommended',
    },
    {
      id: 'product_updates',
      label: 'Product Updates',
      description: 'Be the first to know about new features and improvements.',
      enabled: true,
      category: 'recommended',
    },
    {
      id: 'security_alerts',
      label: 'Security Alerts',
      description: 'Receive important security notifications about your account.',
      enabled: true,
      category: 'essential',
    },
    {
      id: 'skill_suggestions',
      label: 'Skill Suggestions',
      description: 'Personalized skill recommendations based on your goals.',
      enabled: true,
      category: 'recommended',
    },
    {
      id: 'mentor_updates',
      label: 'Mentor Updates',
      description: 'Updates from your mentors and new mentor recommendations.',
      enabled: false,
      category: 'optional',
    },
    {
      id: 'community_news',
      label: 'Community News',
      description: 'News and events from the RoleReady community.',
      enabled: false,
      category: 'optional',
    },
  ]);

  const togglePreference = (id: string) => {
    setPreferences(preferences.map(pref => 
      pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    // Add API call here
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    // Show success message
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'essential': return 'text-red-600 bg-red-50';
      case 'recommended': return 'text-[#5693C1] bg-blue-50';
      case 'optional': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'essential': return 'Essential';
      case 'recommended': return 'Recommended';
      case 'optional': return 'Optional';
      default: return category;
    }
  };

  const filteredPreferences = {
    essential: preferences.filter(p => p.category === 'essential'),
    recommended: preferences.filter(p => p.category === 'recommended'),
    optional: preferences.filter(p => p.category === 'optional'),
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Email Preferences</h2>
        <p className="text-gray-600 text-sm md:text-base">
          Choose what emails you want to receive from us. We recommend keeping essential emails enabled.
        </p>
      </div>

      <div className="space-y-8">
        {/* Essential Emails */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-6 bg-red-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900">Essential Emails</h3>
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">Required</span>
          </div>
          <div className="space-y-3">
            {filteredPreferences.essential.map((preference) => (
              <PreferenceCard
                key={preference.id}
                preference={preference}
                togglePreference={togglePreference}
                getCategoryColor={getCategoryColor}
                getCategoryLabel={getCategoryLabel}
              />
            ))}
          </div>
        </div>

        {/* Recommended Emails */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-6 bg-[#5693C1] rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900">Recommended Emails</h3>
            <span className="text-xs text-[#5693C1] bg-blue-50 px-2 py-1 rounded-full">Recommended</span>
          </div>
          <div className="space-y-3">
            {filteredPreferences.recommended.map((preference) => (
              <PreferenceCard
                key={preference.id}
                preference={preference}
                togglePreference={togglePreference}
                getCategoryColor={getCategoryColor}
                getCategoryLabel={getCategoryLabel}
              />
            ))}
          </div>
        </div>

        {/* Optional Emails */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-6 bg-gray-400 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900">Optional Emails</h3>
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">Optional</span>
          </div>
          <div className="space-y-3">
            {filteredPreferences.optional.map((preference) => (
              <PreferenceCard
                key={preference.id}
                preference={preference}
                togglePreference={togglePreference}
                getCategoryColor={getCategoryColor}
                getCategoryLabel={getCategoryLabel}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Quick Actions</h4>
            <p className="text-xs text-gray-600">Update all preferences at once</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPreferences(preferences.map(p => ({ ...p, enabled: true })))}
              className="px-4 py-2 text-sm bg-[#5693C1] text-white rounded-lg hover:bg-[#4a80b0] transition-colors"
            >
              Enable All
            </button>
            <button
              onClick={() => setPreferences(preferences.map(p => ({
                ...p,
                enabled: p.category === 'essential'
              })))}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Essential Only
            </button>
            <button
              onClick={() => setPreferences(preferences.map(p => ({ ...p, enabled: false })))}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Disable All
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-[#5693C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Email Preferences Notice</h4>
            <p className="text-sm text-gray-600">
              Essential emails are required for account functionality and security. 
              We recommend keeping recommended emails enabled to get the most out of your RoleReady experience.
              You can change these preferences at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
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
            'Save Preferences'
          )}
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Reset Changes
        </button>
      </div>
    </div>
  );
}

// Separate component for preference card
function PreferenceCard({ 
  preference, 
  togglePreference,
  getCategoryColor,
  getCategoryLabel 
}: { 
  preference: EmailPreference;
  togglePreference: (id: string) => void;
  getCategoryColor: (category: string) => string;
  getCategoryLabel: (category: string) => string;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200">
      <div className="flex-1">
        <div className="flex items-start gap-3">
          <div className={`w-2 h-2 mt-2 rounded-full ${preference.enabled ? 'bg-[#5693C1]' : 'bg-gray-300'}`}></div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium text-gray-900">{preference.label}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(preference.category)}`}>
                {getCategoryLabel(preference.category)}
              </span>
            </div>
            <p className="text-sm text-gray-600">{preference.description}</p>
          </div>
        </div>
      </div>
      <button
        onClick={() => togglePreference(preference.id)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:ring-offset-2 ${
          preference.enabled ? 'bg-[#5693C1]' : 'bg-gray-300'
        }`}
        role="switch"
        aria-checked={preference.enabled}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            preference.enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}