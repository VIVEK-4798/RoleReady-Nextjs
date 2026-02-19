'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/hooks';
import { SkeletonPage, useToast } from '@/components/ui';
import SkillSuggestionsReview from './SkillSuggestionsReview';
import { Wand2, Activity, BarChart3, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

// Types
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
    certificates?: Certificate[];
    achievements?: Achievement[];
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

interface Certificate {
  name: string;
  issuer?: string;
  issueDate?: Date | string;
  expiryDate?: Date | string;
  url?: string;
}

interface Achievement {
  _id?: string;
  title: string;
  description?: string;
  date?: Date | string;
  issuer?: string;
}

interface ResumeInfo {
  hasResume: boolean;
  fileName?: string;
  uploadedAt?: string;
}

interface UserSkill {
  _id: string;
  skillId: string;
  skillName: string;
  level: string;
  source: string;
  validationStatus: string;
  validatedBy?: string;
  validatedAt?: string;
  rejectionReason?: string;
}

interface ATSScoreBreakdown {
  relevance: number;
  contextDepth: number;
  structure: number;
  impact: number;
}

interface ATSScoreResult {
  overallScore: number;
  breakdown: ATSScoreBreakdown;
  missingKeywords: string[];
  suggestions: string[];
  calculatedAt: string;
}

// Modal Types
type ModalType = 'about' | 'resume' | 'skills' | 'experience' | 'education' | 'certificate' | 'project' | 'header' | 'responsibility' | 'achievement' | 'social' | null;

export default function NewProfileContent() {
  const { user, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const { update: updateSession } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile data state
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [resume, setResume] = useState<ResumeInfo | null>(null);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Modal state
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editData, setEditData] = useState<Record<string, unknown>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Resume upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  // ATS Score state
  const [atsData, setAtsData] = useState<ATSScoreResult | null>(null);
  const [isCalculatingATS, setIsCalculatingATS] = useState(false);
  const [showATSDetails, setShowATSDetails] = useState(false);

  // Helper function to format dates
  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    } catch {
      return String(dateString);
    }
  };

  // Handle resume file selection
  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!allowedTypes.includes(file.type)) {
        addToast('error', 'Please upload a PDF or Word document');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        addToast('error', 'File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  // Handle resume upload
  const handleResumeUpload = async () => {
    if (!selectedFile || !user?.id) return;

    try {
      setIsUploadingResume(true);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/user/upload-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        addToast('success', 'Resume uploaded successfully');
        setActiveModal(null);
        setSelectedFile(null);
        await fetchProfile(); // Refresh profile data
      } else {
        addToast('error', data.error || 'Failed to upload resume');
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      addToast('error', 'Failed to upload resume');
    } finally {
      setIsUploadingResume(false);
    }
  };

  // Handle ATS Score Calculation
  const handleCalculateATS = async () => {
    if (!user?.id) return;

    try {
      setIsCalculatingATS(true);

      const response = await fetch('/api/ats-score', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success && data.data && data.data.atsScore) {
        setAtsData(data.data.atsScore);
        addToast('success', 'ATS Score calculated successfully');
        setShowATSDetails(true);
      } else {
        addToast('error', data.error || 'Failed to calculate ATS score');
      }
    } catch (error) {
      console.error('ATS calculation error:', error);
      addToast('error', 'Failed to calculate ATS score');
    } finally {
      setIsCalculatingATS(false);
    }
  };

  // Fetch all profile data
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      const [profileRes, skillsRes, resumeRes] = await Promise.all([
        fetch(`/api/users/${user.id}/profile`),
        fetch(`/api/users/${user.id}/skills`),
        fetch(`/api/users/${user.id}/resume?active=true`),
      ]);

      const [profileData, skillsData, resumeData] = await Promise.all([
        profileRes.json(),
        skillsRes.json(),
        resumeRes.json(),
      ]);

      if (profileData.success) {
        // Ensure all profile arrays are initialized
        const profileWithDefaults = {
          ...profileData.data,
          profile: {
            ...profileData.data.profile,
            achievements: profileData.data.profile?.achievements || [],
            certificates: profileData.data.profile?.certificates || [],
            education: profileData.data.profile?.education || [],
            experience: profileData.data.profile?.experience || [],
            projects: profileData.data.profile?.projects || [],
          }
        };
        setProfile(profileWithDefaults);
      }
      if (skillsData.success && skillsData.data) {
        console.log('[PROFILE-FETCH] Skills data:', skillsData.data);
        setSkills(skillsData.data.skills || []);
      }
      if (resumeData.success && Array.isArray(resumeData.data) && resumeData.data.length > 0) {
        const latestResume = resumeData.data[0];
        setResume({
          hasResume: true,
          fileName: latestResume.originalName || latestResume.fileName,
          uploadedAt: latestResume.createdAt,
        });
      } else {
        setResume({ hasResume: false });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchProfile();
    }
  }, [authLoading, user?.id, fetchProfile]);

  // Calculate profile completion progress
  useEffect(() => {
    if (!profile) return;

    let filled = 0;
    const total = 9;

    if (profile.name) filled++;
    if (profile.email) filled++;
    if (profile.profile?.bio?.trim()) filled++;
    if (skills.length > 0) filled++;
    if (profile.profile?.experience?.length > 0) filled++;
    if (profile.profile?.education?.length > 0) filled++;
    if (resume?.hasResume) filled++;
    if (profile.profile?.certificates?.length || 0 > 0) filled++;
    if (profile.profile?.projects?.length > 0) filled++;

    const progressValue = Math.round((filled / total) * 100);
    setProgress(progressValue);
  }, [profile, skills, resume]);

  // Handle save for different sections
  const handleSave = async (type: ModalType, data: Record<string, unknown>) => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      let endpoint = '';
      let body = {};
      let method = data._id ? 'PUT' : 'POST';

      switch (type) {
        case 'about':
        case 'header':
          endpoint = `/api/users/${user.id}/profile`;
          method = 'PUT';
          body = {
            name: data.name,
            mobile: data.mobile,
            profile: {
              bio: data.bio,
              headline: data.headline,
              location: data.location,
              linkedinUrl: data.linkedinUrl,
              githubUrl: data.githubUrl,
              portfolioUrl: data.portfolioUrl,
            },
          };
          break;
        case 'education':
          endpoint = `/api/users/${user.id}/education`;
          body = data;
          break;
        case 'experience':
          endpoint = `/api/users/${user.id}/experience`;
          body = data;
          break;
        case 'project':
          endpoint = `/api/users/${user.id}/projects`;
          body = data;
          break;
        case 'certificate':
          endpoint = `/api/users/${user.id}/certificates`;
          body = {
            _id: data._id,
            name: data.title,
            issuer: data.organization,
            issueDate: data.issuedDate,
            expiryDate: data.expiryDate,
            url: data.url,
          };
          break;
        case 'achievement':
          endpoint = `/api/users/${user.id}/achievements`;
          body = {
            _id: data._id,
            title: data.title,
            description: data.description,
            date: data.date,
            issuer: data.issuer,
          };
          break;
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        addToast('success', 'Saved successfully');
        setActiveModal(null);
        await fetchProfile();
      } else {
        addToast('error', result.error || 'Failed to save');
      }
    } catch (err) {
      console.error('Save error:', err);
      addToast('error', 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete achievement
  const handleDeleteAchievement = async (achievementId: string | number) => {
    if (!user?.id) return;

    if (!confirm('Are you sure you want to delete this achievement?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}/achievements/${achievementId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        addToast('success', 'Achievement deleted successfully');
        await fetchProfile();
      } else {
        addToast('error', result.error || 'Failed to delete achievement');
      }
    } catch (err) {
      console.error('Delete error:', err);
      addToast('error', 'Failed to delete achievement');
    }
  };

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!user?.id) {
      addToast('error', 'User session not found');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      addToast('error', 'Invalid file type. Only JPEG, PNG, and WebP are allowed');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      addToast('error', 'File size too large. Maximum size is 5MB');
      return;
    }

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || 'Upload failed');
      }

      if (result.success) {
        // Update local profile state
        const newImageUrl = result.user.image;
        setProfile(prev => prev ? { ...prev, image: newImageUrl } : null);

        // Update session
        try {
          await updateSession({ image: newImageUrl });
        } catch (sessionError) {
          console.error('Session update error:', sessionError);
        }

        addToast('success', 'Profile image updated successfully');
        router.refresh();
      } else {
        addToast('error', result.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Error during upload:', err);
      addToast('error', err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger file input click
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  if (authLoading || isLoading) {
    return <SkeletonPage />;
  }

  console.log('[PROFILE-RENDER] Skills count:', skills.length);
  console.log('[PROFILE-RENDER] Skills data:', skills);

  const primaryEducation = profile?.profile?.education?.[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and professional profile</p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left - Avatar Section */}
            <div className="flex flex-col items-center md:items-start">
              {/* Avatar with Upload */}
              <div className="relative mb-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {profile?.image ? (
                    <Image
                      src={profile.image}
                      alt={profile.name || 'User'}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#5693C1] to-[#4a82b0] flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {profile?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}

                  {/* Upload Overlay */}
                  <button
                    onClick={handleAvatarClick}
                    disabled={isUploadingImage}
                    className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full"
                  >
                    {isUploadingImage ? (
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="text-white text-center p-2">
                        <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs">Change Photo</span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <button
                  onClick={handleAvatarClick}
                  disabled={isUploadingImage}
                  className="mt-3 text-sm font-medium text-[#5693C1] hover:text-[#4a82b0] transition-colors"
                >
                  {isUploadingImage ? 'Uploading...' : 'Upload new photo'}
                </button>
              </div>
            </div>

            {/* Right - Info Section */}
            <div className="flex-1">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile?.name || 'Your Name'}
                </h2>
                <p className="text-gray-600 text-sm">
                  @{profile?.email?.split('@')[0] || 'username'}
                </p>
                {primaryEducation?.institution && (
                  <p className="text-gray-600 mt-1">
                    {primaryEducation.institution}
                  </p>
                )}
              </div>

              {/* Profile Strength */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                  <span className="text-sm font-bold text-[#5693C1]">{progress}%</span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: '#5693C1'
                    }}
                  />
                </div>

                <p className="text-xs text-gray-500">
                  Complete your profile to increase your readiness score
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Layout for All Sections - One per line */}
        <div className="space-y-6">
          {/* About Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">About</h3>
              <button
                onClick={() => {
                  setEditData({ bio: profile?.profile?.bio || '' });
                  setActiveModal('about');
                }}
                className="p-1.5 text-[#5693C1] hover:text-[#4a82b0] hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit About"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>

            {profile?.profile?.bio ? (
              <div className="text-gray-700 whitespace-pre-line">
                {profile.profile.bio}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                <p>Add a bio to introduce yourself to recruiters</p>
              </div>
            )}
          </div>

          {/* Resume Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Resume</h3>
              <button
                onClick={() => setActiveModal('resume')}
                className="p-1.5 text-[#5693C1] hover:text-[#4a82b0] hover:bg-blue-50 rounded-lg transition-colors"
                title={resume?.hasResume ? 'Update Resume' : 'Upload Resume'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </button>
            </div>

            {resume?.hasResume ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <svg className="w-10 h-10 text-[#5693C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{resume.fileName}</p>
                    {resume.uploadedAt && (
                      <p className="text-sm text-gray-500">
                        Uploaded: {new Date(resume.uploadedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* ATS Score Section */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {!atsData ? (
                    <div className="p-4 bg-gray-50 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-[#5693C1]" />
                          ATS Compatibility Score
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Check how well your resume matches your target role
                        </p>
                      </div>
                      <button
                        onClick={handleCalculateATS}
                        disabled={isCalculatingATS}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCalculatingATS ? (
                          <>
                            <div className="w-4 h-4 border-2 border-[#5693C1] border-t-transparent rounded-full animate-spin" />
                            Calculating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 text-[#5693C1]" />
                            Calculate Score
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white">
                      <div className="p-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 ${atsData.overallScore >= 80 ? 'border-green-500 text-green-700' :
                            atsData.overallScore >= 60 ? 'border-amber-500 text-amber-700' :
                              'border-red-500 text-red-700'
                            }`}>
                            {atsData.overallScore}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">ATS Score</h4>
                            <p className="text-xs text-gray-500">
                              Calculated on {new Date(atsData.calculatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCalculateATS}
                            disabled={isCalculatingATS}
                            className="p-1.5 text-gray-400 hover:text-[#5693C1] transition-colors"
                            title="Recalculate"
                          >
                            <div className={isCalculatingATS ? "animate-spin" : ""}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </div>
                          </button>
                          <button
                            onClick={() => setShowATSDetails(!showATSDetails)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showATSDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {showATSDetails && (
                        <div className="p-4 border-t border-gray-100 bg-white">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600">Keywords</span>
                                <span className="font-semibold">{atsData.breakdown.relevance}/100</span>
                              </div>
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${atsData.breakdown.relevance}%` }} />
                              </div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600">Context</span>
                                <span className="font-semibold">{atsData.breakdown.contextDepth}/100</span>
                              </div>
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${atsData.breakdown.contextDepth}%` }} />
                              </div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600">Structure</span>
                                <span className="font-semibold">{atsData.breakdown.structure}/100</span>
                              </div>
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${atsData.breakdown.structure}%` }} />
                              </div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600">Impact</span>
                                <span className="font-semibold">{atsData.breakdown.impact}/100</span>
                              </div>
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${atsData.breakdown.impact}%` }} />
                              </div>
                            </div>
                          </div>

                          {atsData.suggestions.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                Top Suggestions
                              </h5>
                              <ul className="space-y-1">
                                {atsData.suggestions.slice(0, 3).map((suggestion, idx) => (
                                  <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                    <span className="mt-1 w-1 h-1 bg-gray-400 rounded-full flex-shrink-0" />
                                    {suggestion}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Extract Skills Button - Always visible when resume exists */}
                <SkillSuggestionsReview onSkillsAdded={() => fetchProfile()} />
              </div>
            ) : (
              <div className="text-gray-500 italic">
                <p>Upload your resume for better job matching</p>
              </div>
            )}
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
              <button
                onClick={() => router.push('/dashboard/skills')}
                className="p-1.5 text-[#5693C1] hover:text-[#4a82b0] hover:bg-blue-50 rounded-lg transition-colors"
                title={skills.length > 0 ? 'Manage Skills' : 'Add Skills'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            {skills.length > 0 ? (
              <div className="space-y-3">
                {skills.map((skill) => (
                  <div key={skill._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{skill.skillName}</span>
                        {skill.validationStatus === 'validated' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Mentor Verified
                          </span>
                        )}
                        {skill.validationStatus === 'pending' && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded text-xs font-medium">
                            Pending Validation
                          </span>
                        )}
                        {skill.validationStatus === 'rejected' && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs font-medium">
                            Rejected
                          </span>
                        )}
                        {skill.validationStatus === 'none' && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-xs font-medium">
                            Not Validated
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="capitalize">Level: {skill.level}</span>
                        <span>•</span>
                        <span className="capitalize">Source: {skill.source}</span>
                        {skill.validatedAt && (
                          <>
                            <span>•</span>
                            <span>Validated: {new Date(skill.validatedAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                <p>Add skills to showcase your expertise</p>
              </div>
            )}
          </div>

          {/* Experience Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
              <button
                onClick={() => {
                  if (profile?.profile?.experience?.length) {
                    const firstExp = profile.profile.experience[0];
                    setEditData({
                      _id: firstExp._id,
                      title: firstExp.title,
                      company: firstExp.company,
                      location: firstExp.location || '',
                      startDate: firstExp.startDate || '',
                      endDate: firstExp.endDate || '',
                      isCurrent: firstExp.isCurrent || false,
                      description: firstExp.description || '',
                      skills: firstExp.skills || [],
                    });
                  } else {
                    setEditData({});
                  }
                  setActiveModal('experience');
                }}
                className="p-1.5 text-[#5693C1] hover:text-[#4a82b0] hover:bg-blue-50 rounded-lg transition-colors"
                title={profile?.profile?.experience?.length ? 'Edit Experience' : 'Add Experience'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={profile?.profile?.experience?.length ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                </svg>
              </button>
            </div>

            {profile?.profile?.experience?.length ? (
              <div className="space-y-4">
                {profile.profile.experience.slice(0, 3).map((exp) => (
                  <div key={exp._id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{exp.title}</h4>
                        <p className="text-gray-600 text-sm">{exp.company}</p>
                        {exp.location && <p className="text-gray-500 text-xs">{exp.location}</p>}
                      </div>
                      {exp.startDate && (
                        <span className="text-sm text-gray-500">
                          {formatDate(exp.startDate)} {exp.endDate ? `- ${formatDate(exp.endDate)}` : '- Present'}
                        </span>
                      )}
                    </div>
                    {exp.description && (
                      <p className="text-gray-600 text-sm mt-2">{exp.description}</p>
                    )}
                    {exp.skills && exp.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exp.skills.slice(0, 5).map((skill, index) => (
                          <span key={index} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                <p>Add your work experience</p>
              </div>
            )}
          </div>

          {/* Education Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Education</h3>
              <button
                onClick={() => {
                  if (profile?.profile?.education?.length) {
                    const firstEdu = profile.profile.education[0];
                    setEditData({
                      _id: firstEdu._id,
                      institution: firstEdu.institution,
                      degree: firstEdu.degree,
                      fieldOfStudy: firstEdu.fieldOfStudy || '',
                      startDate: firstEdu.startDate || '',
                      endDate: firstEdu.endDate || '',
                      grade: firstEdu.grade || '',
                      description: firstEdu.description || '',
                    });
                  } else {
                    setEditData({});
                  }
                  setActiveModal('education');
                }}
                className="p-1.5 text-[#5693C1] hover:text-[#4a82b0] hover:bg-blue-50 rounded-lg transition-colors"
                title={profile?.profile?.education?.length ? 'Edit Education' : 'Add Education'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={profile?.profile?.education?.length ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                </svg>
              </button>
            </div>

            {profile?.profile?.education?.length ? (
              <div className="space-y-4">
                {profile.profile.education.slice(0, 3).map((edu) => (
                  <div key={edu._id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{edu.institution}</h4>
                        <p className="text-gray-600 text-sm">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</p>
                        {edu.grade && <p className="text-gray-500 text-xs">Grade: {edu.grade}</p>}
                      </div>
                      {edu.startDate && (
                        <span className="text-sm text-gray-500">
                          {formatDate(edu.startDate)} {edu.endDate ? `- ${formatDate(edu.endDate)}` : '- Present'}
                        </span>
                      )}
                    </div>
                    {edu.description && (
                      <p className="text-gray-600 text-sm mt-2">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                <p>Add your education background</p>
              </div>
            )}
          </div>

          {/* Certificates Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Certificates</h3>
              <button
                onClick={() => {
                  setEditData({});
                  setActiveModal('certificate');
                }}
                className="p-1.5 text-[#5693C1] hover:text-[#4a82b0] hover:bg-blue-50 rounded-lg transition-colors"
                title="Add Certificate"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            {profile?.profile?.certificates?.length ? (
              <div className="space-y-3">
                {profile.profile.certificates.slice(0, 3).map((cert, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{cert.name}</h4>
                        {cert.issuer && <p className="text-gray-600 text-sm">{cert.issuer}</p>}
                        {cert.issueDate && (
                          <p className="text-gray-500 text-xs">
                            Issued: {new Date(cert.issueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setEditData({
                            _id: index,
                            title: cert.name,
                            organization: cert.issuer || '',
                            issuedDate: cert.issueDate || '',
                            expiryDate: cert.expiryDate || '',
                            url: cert.url || '',
                          });
                          setActiveModal('certificate');
                        }}
                        className="p-1.5 text-[#5693C1] hover:text-[#4a82b0] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Certificate"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                <p>Add your professional certificates</p>
              </div>
            )}
          </div>

          {/* Projects Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push('/dashboard/profile/import-github')}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Import from GitHub"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>Import GitHub</span>
                </button>
                <button
                  onClick={() => {
                    setEditData({});
                    setActiveModal('project');
                  }}
                  className="p-1.5 text-[#5693C1] hover:text-[#4a82b0] hover:bg-blue-50 rounded-lg transition-colors"
                  title="Add Project"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>

            {profile?.profile?.projects?.length ? (
              <div className="space-y-4">
                {profile.profile.projects.slice(0, 3).map((project) => (
                  <div key={project._id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-gray-900 flex-1">{project.name}</h4>
                          <button
                            onClick={() => {
                              setEditData({
                                _id: project._id,
                                name: project.name,
                                description: project.description || '',
                                url: project.url || '',
                                githubUrl: project.githubUrl || '',
                                technologies: project.technologies || [],
                                startDate: project.startDate || '',
                                endDate: project.endDate || '',
                                isOngoing: project.isOngoing || false,
                              });
                              setActiveModal('project');
                            }}
                            className="p-1.5 text-[#5693C1] hover:text-[#4a82b0] hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Project"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                        {project.description && (
                          <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                        )}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.technologies.slice(0, 5).map((tech, index) => (
                              <span key={index} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                        {project.startDate && (
                          <p className="text-sm text-gray-500 mt-2">
                            {formatDate(project.startDate)} {project.endDate ? `- ${formatDate(project.endDate)}` : project.isOngoing ? '- Ongoing' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                <p>Showcase your projects</p>
              </div>
            )}
          </div>

          {/* Achievements Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
              <button
                onClick={() => {
                  setEditData({});
                  setActiveModal('achievement');
                }}
                className="p-1.5 text-[#5693C1] hover:text-[#4a82b0] hover:bg-blue-50 rounded-lg transition-colors"
                title="Add Achievement"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            {profile?.profile?.achievements && profile.profile.achievements.length > 0 ? (
              <div className="space-y-3">
                {profile.profile.achievements.map((achievement, index) => (
                  <div key={achievement._id || index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                // Format date for date input (YYYY-MM-DD)
                                let formattedDate = '';
                                if (achievement.date) {
                                  const dateObj = new Date(achievement.date);
                                  formattedDate = dateObj.toISOString().split('T')[0];
                                }

                                setEditData({
                                  _id: achievement._id || index,
                                  title: achievement.title,
                                  description: achievement.description || '',
                                  date: formattedDate,
                                  issuer: achievement.issuer || '',
                                });
                                setActiveModal('achievement');
                              }}
                              className="p-1.5 text-[#5693C1] hover:text-[#4a82b0] hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Achievement"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteAchievement(achievement._id || index)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Achievement"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {achievement.issuer && (
                          <p className="text-gray-600 text-sm">Issued by: {achievement.issuer}</p>
                        )}
                        {achievement.description && (
                          <p className="text-gray-600 text-sm mt-1">{achievement.description}</p>
                        )}
                        {achievement.date && (
                          <p className="text-gray-500 text-xs mt-2">
                            Date: {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                <p>Highlight your achievements</p>
              </div>
            )}
          </div>
        </div>

        {/* ===== MODALS ===== */}
        {/* Resume Modal */}
        {activeModal === 'resume' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {resume?.hasResume ? 'Update Resume' : 'Upload Resume'}
                  </h3>
                  <button onClick={() => {
                    setActiveModal(null);
                    setSelectedFile(null);
                  }} className="text-gray-400 hover:text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose Resume File
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          {selectedFile ? (
                            <p className="text-sm text-gray-700 font-medium">{selectedFile.name}</p>
                          ) : (
                            <>
                              <p className="mb-1 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                              <p className="text-xs text-gray-500">PDF or Word (Max 5MB)</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleResumeFileChange}
                        />
                      </label>
                    </div>
                    {selectedFile && (
                      <div className="mt-2 text-xs text-gray-500">
                        Size: {(selectedFile.size / 1024).toFixed(2)} KB
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex">
                      <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="text-xs text-blue-700">
                        <p className="font-medium mb-1">Supported formats:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>PDF (.pdf)</li>
                          <li>Microsoft Word (.doc, .docx)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium flex-1 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResumeUpload}
                    disabled={!selectedFile || isUploadingResume}
                    className="px-4 py-2 bg-[#5693C1] hover:bg-[#4a82b0] text-white rounded-lg font-medium flex-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploadingResume ? 'Uploading...' : 'Upload Resume'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* About Modal */}
        {activeModal === 'about' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Edit About</h3>
                  <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                    <textarea
                      value={editData.bio as string || ''}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      rows={5}
                      maxLength={1000}
                      placeholder="Write about yourself..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">{(editData.bio as string || '').length}/1000</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium flex-1 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave('about', editData)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#5693C1] hover:bg-[#4a82b0] text-white rounded-lg font-medium flex-1 transition-colors disabled:opacity-70"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Experience Modal */}
        {activeModal === 'experience' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Add Work Experience</h3>
                  <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                    <input
                      type="text"
                      value={editData.title as string || ''}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      placeholder="Software Engineer"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                    <input
                      type="text"
                      value={editData.company as string || ''}
                      onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                      placeholder="Company Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editData.description as string || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={3}
                      placeholder="Describe your responsibilities..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium flex-1 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave('experience', editData)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#5693C1] hover:bg-[#4a82b0] text-white rounded-lg font-medium flex-1 transition-colors disabled:opacity-70"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Education Modal */}
        {activeModal === 'education' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Add Education</h3>
                  <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
                    <input
                      type="text"
                      value={editData.institution as string || ''}
                      onChange={(e) => setEditData({ ...editData, institution: e.target.value })}
                      placeholder="University/College Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
                    <input
                      type="text"
                      value={editData.degree as string || ''}
                      onChange={(e) => setEditData({ ...editData, degree: e.target.value })}
                      placeholder="Bachelor's, Master's, etc."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium flex-1 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave('education', editData)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#5693C1] hover:bg-[#4a82b0] text-white rounded-lg font-medium flex-1 transition-colors disabled:opacity-70"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder Modals */}
        {['responsibility', 'social'].includes(activeModal || '') && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activeModal === 'responsibility' && 'Add Responsibility'}
                    {activeModal === 'social' && 'Add Social Links'}
                  </h3>
                  <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="text-center py-8">
                  <p className="text-gray-500">This feature is coming soon!</p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium flex-1 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Modal */}
        {activeModal === 'certificate' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editData._id !== undefined ? 'Edit Certificate' : 'Add Certificate'}
                  </h3>
                  <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Name *</label>
                    <input
                      type="text"
                      value={editData.title as string || ''}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      placeholder="AWS Certified Solutions Architect"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
                    <input
                      type="text"
                      value={editData.organization as string || ''}
                      onChange={(e) => setEditData({ ...editData, organization: e.target.value })}
                      placeholder="Amazon Web Services"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                    <input
                      type="date"
                      value={editData.issuedDate as string || ''}
                      onChange={(e) => setEditData({ ...editData, issuedDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={editData.expiryDate as string || ''}
                      onChange={(e) => setEditData({ ...editData, expiryDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificate URL</label>
                    <input
                      type="url"
                      value={editData.url as string || ''}
                      onChange={(e) => setEditData({ ...editData, url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium flex-1 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave('certificate', editData)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#5693C1] hover:bg-[#4a82b0] text-white rounded-lg font-medium flex-1 transition-colors disabled:opacity-70"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Project Modal */}
        {activeModal === 'project' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editData._id ? 'Edit Project' : 'Add Project'}
                  </h3>
                  <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                    <input
                      type="text"
                      value={editData.name as string || ''}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      placeholder="E-commerce Platform"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editData.description as string || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={3}
                      placeholder="Describe your project..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project URL</label>
                    <input
                      type="url"
                      value={editData.url as string || ''}
                      onChange={(e) => setEditData({ ...editData, url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                    <input
                      type="url"
                      value={editData.githubUrl as string || ''}
                      onChange={(e) => setEditData({ ...editData, githubUrl: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Technologies (comma-separated)</label>
                    <input
                      type="text"
                      value={Array.isArray(editData.technologies) ? (editData.technologies as string[]).join(', ') : ''}
                      onChange={(e) => setEditData({
                        ...editData,
                        technologies: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                      })}
                      placeholder="React, Node.js, MongoDB"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={editData.startDate as string || ''}
                        onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={editData.endDate as string || ''}
                        onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                        disabled={editData.isOngoing as boolean}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isOngoing"
                      checked={editData.isOngoing as boolean || false}
                      onChange={(e) => setEditData({ ...editData, isOngoing: e.target.checked, endDate: e.target.checked ? '' : editData.endDate })}
                      className="w-4 h-4 text-[#5693C1] border-gray-300 rounded focus:ring-[#5693C1]"
                    />
                    <label htmlFor="isOngoing" className="ml-2 text-sm text-gray-700">
                      This is an ongoing project
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium flex-1 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave('project', editData)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#5693C1] hover:bg-[#4a82b0] text-white rounded-lg font-medium flex-1 transition-colors disabled:opacity-70"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievement Modal */}
        {activeModal === 'achievement' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editData._id !== undefined ? 'Edit Achievement' : 'Add Achievement'}
                  </h3>
                  <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Achievement Title *</label>
                    <input
                      type="text"
                      value={editData.title as string || ''}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      placeholder="Employee of the Year"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editData.description as string || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={3}
                      placeholder="Describe your achievement..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issued By</label>
                    <input
                      type="text"
                      value={editData.issuer as string || ''}
                      onChange={(e) => setEditData({ ...editData, issuer: e.target.value })}
                      placeholder="Organization name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={editData.date as string || ''}
                      onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium flex-1 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave('achievement', editData)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#5693C1] hover:bg-[#4a82b0] text-white rounded-lg font-medium flex-1 transition-colors disabled:opacity-70"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div >
  );
}