/**
 * Profile Content Component
 * 
 * Client component for viewing and editing user profile.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks';
import { SkeletonPage, useToast } from '@/components/ui';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  image?: string;
  profile: {
    bio?: string;
    headline?: string;
    location?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    education: Education[];
    experience: Experience[];
    projects: Project[];
  };
}

interface Education {
  _id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

interface Experience {
  _id: string;
  company: string;
  title: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  skills?: string[];
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  url?: string;
  githubUrl?: string;
  technologies?: string[];
  startDate?: string;
  endDate?: string;
  isOngoing?: boolean;
}

export default function ProfileContent() {
  const { user, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    bio: '',
    headline: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/users/${user.id}/profile`);
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data);
        setFormData({
          name: data.data.name || '',
          mobile: data.data.mobile || '',
          bio: data.data.profile?.bio || '',
          headline: data.data.profile?.headline || '',
          location: data.data.profile?.location || '',
          linkedinUrl: data.data.profile?.linkedinUrl || '',
          githubUrl: data.data.profile?.githubUrl || '',
          portfolioUrl: data.data.profile?.portfolioUrl || '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchProfile();
    }
  }, [authLoading, user?.id, fetchProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/users/${user.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          mobile: formData.mobile,
          profile: {
            bio: formData.bio,
            headline: formData.headline,
            location: formData.location,
            linkedinUrl: formData.linkedinUrl,
            githubUrl: formData.githubUrl,
            portfolioUrl: formData.portfolioUrl,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        addToast('success', 'Profile updated successfully');
        setIsEditing(false);
        fetchProfile();
      } else {
        setError(data.error || 'Failed to update profile');
        addToast('error', data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('Failed to save profile');
      addToast('error', 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return <SkeletonPage />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your personal information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:shadow-md active:scale-95"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg animate-slide-in">
          {error}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {/* Cover & Avatar */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600" />
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-12 mb-4">
            <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-800 flex items-center justify-center text-3xl font-bold text-gray-600 dark:text-gray-300">
              {formData.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Professional Headline
                </label>
                <input
                  type="text"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  placeholder="e.g., Full Stack Developer | React & Node.js"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Bangalore, India"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    placeholder="https://yourportfolio.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {profile?.name || 'User'}
              </h2>
              {profile?.profile?.headline && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {profile.profile.headline}
                </p>
              )}
              {profile?.profile?.location && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {profile.profile.location}
                </p>
              )}
              {profile?.profile?.bio && (
                <p className="text-gray-700 dark:text-gray-300 mt-4">
                  {profile.profile.bio}
                </p>
              )}
              
              {/* Social Links */}
              <div className="flex gap-3 mt-4">
                {profile?.profile?.linkedinUrl && (
                  <a
                    href={profile.profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    LinkedIn
                  </a>
                )}
                {profile?.profile?.githubUrl && (
                  <a
                    href={profile.profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    GitHub
                  </a>
                )}
                {profile?.profile?.portfolioUrl && (
                  <a
                    href={profile.profile.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700"
                  >
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Education Section */}
      <ProfileSection
        title="Education"
        items={profile?.profile?.education || []}
        type="education"
        userId={user?.id || ''}
        onRefresh={fetchProfile}
      />

      {/* Experience Section */}
      <ProfileSection
        title="Work Experience"
        items={profile?.profile?.experience || []}
        type="experience"
        userId={user?.id || ''}
        onRefresh={fetchProfile}
      />

      {/* Projects Section */}
      <ProfileSection
        title="Projects"
        items={profile?.profile?.projects || []}
        type="projects"
        userId={user?.id || ''}
        onRefresh={fetchProfile}
      />
    </div>
  );
}

// Profile Section Component for Education, Experience, Projects
interface ProfileSectionProps {
  title: string;
  items: (Education | Experience | Project)[];
  type: 'education' | 'experience' | 'projects';
  userId: string;
  onRefresh: () => void;
}

function ProfileSection({ title, items, type, userId, onRefresh }: ProfileSectionProps) {
  const [isAdding, setIsAdding] = useState(false);

  const renderItem = (item: Education | Experience | Project) => {
    if (type === 'education') {
      const edu = item as Education;
      return (
        <div key={edu._id} className="flex justify-between items-start py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{edu.institution}</h4>
            <p className="text-gray-600 dark:text-gray-400">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</p>
            {edu.grade && <p className="text-sm text-gray-500 dark:text-gray-500">Grade: {edu.grade}</p>}
          </div>
        </div>
      );
    }

    if (type === 'experience') {
      const exp = item as Experience;
      return (
        <div key={exp._id} className="flex justify-between items-start py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{exp.title}</h4>
            <p className="text-gray-600 dark:text-gray-400">{exp.company}{exp.location ? ` • ${exp.location}` : ''}</p>
            {exp.isCurrent && <span className="text-sm text-green-600 dark:text-green-400">Current</span>}
            {exp.description && <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{exp.description}</p>}
          </div>
        </div>
      );
    }

    if (type === 'projects') {
      const proj = item as Project;
      return (
        <div key={proj._id} className="flex justify-between items-start py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{proj.name}</h4>
            {proj.description && <p className="text-gray-600 dark:text-gray-400">{proj.description}</p>}
            {proj.technologies && proj.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {proj.technologies.map((tech, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          + Add {title.replace('Work ', '')}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No {title.toLowerCase()} added yet
        </p>
      ) : (
        <div>{items.map(renderItem)}</div>
      )}

      {/* Add Form Modal - Placeholder for now */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add {title.replace('Work ', '')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Form coming soon...
            </p>
            <button
              onClick={() => setIsAdding(false)}
              className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
