/**
 * User Profile Page - Complete Recreation
 * 
 * Faithful recreation from the old RoleReady React project.
 * Includes:
 * - Profile Header (Avatar, Name, Email Handle, College, Progress)
 * - About Section
 * - Resume Section
 * - Skills Section (with validation badges)
 * - Work Experience Section
 * - Education Section
 * - Certificates Section
 * - Projects Section
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks';
import { SkeletonPage, useToast } from '@/components/ui';

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
  _id: string;
  title: string;
  organization: string;
  issuedDate?: string;
  skills?: string;
  description?: string;
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

// Modal Types
type ModalType = 'about' | 'resume' | 'skills' | 'experience' | 'education' | 'certificate' | 'project' | 'header' | null;

export default function NewProfileContent() {
  const { user, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  
  // Profile data state
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [resume, setResume] = useState<ResumeInfo | null>(null);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  
  // Modal state
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editData, setEditData] = useState<Record<string, unknown>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all profile data
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Parallel fetch
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
        setProfile(profileData.data);
      }
      if (skillsData.success && skillsData.skills) {
        setSkills(skillsData.skills);
      }
      // Resume API returns array of resumes
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
    
    setProgress(Math.round((filled / total) * 100));
  }, [profile, skills, resume]);

  // Handle save for different sections
  const handleSave = async (type: ModalType, data: Record<string, unknown>) => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      let endpoint = '';
      let body = {};
      
      switch (type) {
        case 'about':
        case 'header':
          endpoint = `/api/users/${user.id}/profile`;
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
          body = { education: data };
          break;
        case 'experience':
          endpoint = `/api/users/${user.id}/experience`;
          body = { experience: data };
          break;
        case 'project':
          endpoint = `/api/users/${user.id}/projects`;
          body = { project: data };
          break;
        case 'certificate':
          endpoint = `/api/users/${user.id}/certificates`;
          body = { certificate: data };
          break;
      }
      
      const response = await fetch(endpoint, {
        method: data._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const result = await response.json();
      
      if (result.success) {
        addToast('success', 'Saved successfully');
        setActiveModal(null);
        fetchProfile();
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

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get validation badge
  const getValidationBadge = (skill: UserSkill) => {
    if (skill.validationStatus === 'validated') {
      return { icon: '🎓', label: 'Validated', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-300 dark:border-blue-700' };
    }
    if (skill.validationStatus === 'rejected') {
      return { icon: '⚠️', label: 'Rejected', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700' };
    }
    if (skill.source === 'resume') {
      return { icon: '📄', label: 'Resume', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-300 dark:border-purple-700' };
    }
    return { icon: '✋', label: 'Self', className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-600' };
  };

  // Get level color
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-blue-600 dark:text-blue-400';
      case 'intermediate': return 'text-purple-600 dark:text-purple-400';
      case 'advanced': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (authLoading || isLoading) {
    return <SkeletonPage />;
  }

  const primaryEducation = profile?.profile?.education?.[0];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ===== PROFILE HEADER ===== */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white dark:border-gray-700">
              {profile?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            {/* Info */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {profile?.name || 'User Name'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                @{profile?.email?.split('@')[0] || 'username'}
              </p>
              {primaryEducation?.institution && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {primaryEducation.institution}
                </p>
              )}
              
              {/* Progress Bar */}
              <div className="mt-3 w-32">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Profile</span>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Edit Button */}
          <button
            onClick={() => {
              setEditData({
                name: profile?.name || '',
                mobile: profile?.mobile || '',
                bio: profile?.profile?.bio || '',
                headline: profile?.profile?.headline || '',
                location: profile?.profile?.location || '',
                linkedinUrl: profile?.profile?.linkedinUrl || '',
                githubUrl: profile?.profile?.githubUrl || '',
                portfolioUrl: profile?.profile?.portfolioUrl || '',
              });
              setActiveModal('header');
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      {/* ===== ABOUT SECTION ===== */}
      <ProfileSection
        title="About"
        icon="user"
        onEdit={() => {
          setEditData({ bio: profile?.profile?.bio || '' });
          setActiveModal('about');
        }}
        imageSrc="/img/profile/about.webp"
      >
        {profile?.profile?.bio ? (
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{profile.profile.bio}</p>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Add a short bio about yourself...</p>
        )}
      </ProfileSection>

      {/* ===== RESUME SECTION ===== */}
      <ProfileSection
        title="Resume"
        icon="document"
        onEdit={() => setActiveModal('resume')}
        imageSrc="/img/profile/resume.webp"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Add your Resume & get your profile filled in a click!
        </p>
        {resume?.hasResume ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-600 dark:text-green-400 font-medium">Resume uploaded</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm">{resume.fileName}</span>
            </div>
            {resume.uploadedAt && (
              <p className="text-xs text-gray-500 dark:text-gray-500 ml-6">
                Uploaded on {formatDate(resume.uploadedAt)}
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={() => setActiveModal('resume')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Upload Resume
          </button>
        )}
      </ProfileSection>

      {/* ===== SKILLS SECTION ===== */}
      <ProfileSection
        title="Skills"
        icon="skills"
        onEdit={() => setActiveModal('skills')}
        imageSrc="/img/profile/skills.webp"
      >
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => {
              const badge = getValidationBadge(skill);
              return (
                <div
                  key={skill._id}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                    skill.validationStatus === 'validated'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 dark:border-blue-600'
                      : skill.validationStatus === 'rejected'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-600'
                      : 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <span className="font-medium text-gray-900 dark:text-white">{skill.skillName}</span>
                  <span className={`text-xs ${getLevelColor(skill.level)}`}>
                    ({skill.level})
                  </span>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${badge.className}`}>
                    {badge.icon}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <button
            onClick={() => setActiveModal('skills')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Add Skills
          </button>
        )}
      </ProfileSection>

      {/* ===== WORK EXPERIENCE SECTION ===== */}
      <ProfileSection
        title="Work Experience"
        icon="briefcase"
        onEdit={() => {
          setEditData({});
          setActiveModal('experience');
        }}
        imageSrc="/img/profile/work_experience.webp"
      >
        {profile?.profile?.experience?.length ? (
          <div className="space-y-4">
            {profile.profile.experience.map((exp) => (
              <div key={exp._id} className="border-l-2 border-blue-200 dark:border-blue-800 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {exp.title} <span className="font-normal text-gray-600 dark:text-gray-400">at</span> {exp.company}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                </p>
                {exp.location && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{exp.location}</p>
                )}
                {exp.description && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setActiveModal('experience')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Add Work Experience
          </button>
        )}
      </ProfileSection>

      {/* ===== EDUCATION SECTION ===== */}
      <ProfileSection
        title="Education"
        icon="academic"
        onEdit={() => {
          setEditData({});
          setActiveModal('education');
        }}
        imageSrc="/img/profile/education.webp"
      >
        {profile?.profile?.education?.length ? (
          <div className="space-y-4">
            {profile.profile.education.map((edu) => (
              <div key={edu._id} className="border-l-2 border-green-200 dark:border-green-800 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">{edu.institution}</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                </p>
                {edu.startDate && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {edu.startDate} - {edu.endDate || 'Present'}
                  </p>
                )}
                {edu.grade && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Grade: {edu.grade}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setActiveModal('education')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Add Education
          </button>
        )}
      </ProfileSection>

      {/* ===== CERTIFICATES SECTION ===== */}
      <ProfileSection
        title="Certificates"
        icon="badge"
        onEdit={() => {
          setEditData({});
          setActiveModal('certificate');
        }}
        imageSrc="/img/profile/certificate.webp"
      >
        {profile?.profile?.certificates?.length ? (
          <div className="space-y-4">
            {profile.profile.certificates.map((cert) => (
              <div key={cert._id} className="border-l-2 border-purple-200 dark:border-purple-800 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">{cert.title}</h4>
                <p className="text-gray-600 dark:text-gray-400">by {cert.organization}</p>
                {cert.issuedDate && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Issued: {cert.issuedDate}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setActiveModal('certificate')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Add Certificate
          </button>
        )}
      </ProfileSection>

      {/* ===== PROJECTS SECTION ===== */}
      <ProfileSection
        title="Projects"
        icon="folder"
        onEdit={() => {
          setEditData({});
          setActiveModal('project');
        }}
        imageSrc="/img/profile/projects.webp"
      >
        {profile?.profile?.projects?.length ? (
          <div className="space-y-4">
            {profile.profile.projects.map((proj) => (
              <div key={proj._id} className="border-l-2 border-orange-200 dark:border-orange-800 pl-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">{proj.name}</h4>
                {proj.description && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{proj.description}</p>
                )}
                {proj.url && (
                  <a
                    href={proj.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {proj.url}
                  </a>
                )}
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {proj.technologies.map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setActiveModal('project')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Add Projects
          </button>
        )}
      </ProfileSection>

      {/* ===== MODALS ===== */}
      {/* About/Header Edit Modal */}
      {(activeModal === 'about' || activeModal === 'header') && (
        <Modal
          title={activeModal === 'about' ? 'Edit About' : 'Edit Profile'}
          onClose={() => setActiveModal(null)}
          onSave={() => handleSave(activeModal, editData)}
          isSaving={isSaving}
        >
          {activeModal === 'header' && (
            <>
              <FormField label="Full Name" name="name" value={editData.name as string} onChange={(v) => setEditData({...editData, name: v})} />
              <FormField label="Mobile" name="mobile" value={editData.mobile as string} onChange={(v) => setEditData({...editData, mobile: v})} />
              <FormField label="Headline" name="headline" value={editData.headline as string} onChange={(v) => setEditData({...editData, headline: v})} placeholder="e.g., Full Stack Developer" />
              <FormField label="Location" name="location" value={editData.location as string} onChange={(v) => setEditData({...editData, location: v})} placeholder="e.g., Bangalore, India" />
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About</label>
            <textarea
              value={editData.bio as string || ''}
              onChange={(e) => setEditData({...editData, bio: e.target.value})}
              rows={5}
              maxLength={1000}
              placeholder="Write about yourself..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{(editData.bio as string || '').length}/1000</p>
          </div>
          {activeModal === 'header' && (
            <>
              <FormField label="LinkedIn URL" name="linkedinUrl" value={editData.linkedinUrl as string} onChange={(v) => setEditData({...editData, linkedinUrl: v})} placeholder="https://linkedin.com/in/..." />
              <FormField label="GitHub URL" name="githubUrl" value={editData.githubUrl as string} onChange={(v) => setEditData({...editData, githubUrl: v})} placeholder="https://github.com/..." />
              <FormField label="Portfolio URL" name="portfolioUrl" value={editData.portfolioUrl as string} onChange={(v) => setEditData({...editData, portfolioUrl: v})} placeholder="https://yoursite.com" />
            </>
          )}
        </Modal>
      )}

      {/* Resume Modal */}
      {activeModal === 'resume' && (
        <Modal
          title="Upload Resume"
          onClose={() => setActiveModal(null)}
          hideFooter
        >
          <ResumeUploader
            userId={user?.id || ''}
            onSuccess={() => {
              setActiveModal(null);
              fetchProfile();
            }}
          />
        </Modal>
      )}

      {/* Skills Modal - Redirect to skills page */}
      {activeModal === 'skills' && (
        <Modal
          title="Manage Skills"
          onClose={() => setActiveModal(null)}
          hideFooter
        >
          <div className="text-center py-4">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Manage your skills from the dedicated skills page.
            </p>
            <a
              href="/dashboard/skills"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Go to Skills Page
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </Modal>
      )}

      {/* Experience Modal */}
      {activeModal === 'experience' && (
        <Modal
          title="Add Work Experience"
          onClose={() => setActiveModal(null)}
          onSave={() => handleSave('experience', editData)}
          isSaving={isSaving}
        >
          <FormField label="Job Title *" name="title" value={editData.title as string} onChange={(v) => setEditData({...editData, title: v})} placeholder="Software Engineer" />
          <FormField label="Company *" name="company" value={editData.company as string} onChange={(v) => setEditData({...editData, company: v})} placeholder="Company Name" />
          <FormField label="Location" name="location" value={editData.location as string} onChange={(v) => setEditData({...editData, location: v})} placeholder="City, Country" />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" name="startDate" type="date" value={editData.startDate as string} onChange={(v) => setEditData({...editData, startDate: v})} />
            <FormField label="End Date" name="endDate" type="date" value={editData.endDate as string} onChange={(v) => setEditData({...editData, endDate: v})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={editData.description as string || ''}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              rows={3}
              placeholder="Describe your responsibilities..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>
        </Modal>
      )}

      {/* Education Modal */}
      {activeModal === 'education' && (
        <Modal
          title="Add Education"
          onClose={() => setActiveModal(null)}
          onSave={() => handleSave('education', editData)}
          isSaving={isSaving}
        >
          <FormField label="Institution *" name="institution" value={editData.institution as string} onChange={(v) => setEditData({...editData, institution: v})} placeholder="University/College Name" />
          <FormField label="Degree *" name="degree" value={editData.degree as string} onChange={(v) => setEditData({...editData, degree: v})} placeholder="Bachelor's, Master's, etc." />
          <FormField label="Field of Study" name="fieldOfStudy" value={editData.fieldOfStudy as string} onChange={(v) => setEditData({...editData, fieldOfStudy: v})} placeholder="Computer Science, etc." />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" name="startDate" type="month" value={editData.startDate as string} onChange={(v) => setEditData({...editData, startDate: v})} />
            <FormField label="End Date" name="endDate" type="month" value={editData.endDate as string} onChange={(v) => setEditData({...editData, endDate: v})} />
          </div>
          <FormField label="Grade/CGPA" name="grade" value={editData.grade as string} onChange={(v) => setEditData({...editData, grade: v})} placeholder="3.8/4.0" />
        </Modal>
      )}

      {/* Certificate Modal */}
      {activeModal === 'certificate' && (
        <Modal
          title="Add Certificate"
          onClose={() => setActiveModal(null)}
          onSave={() => handleSave('certificate', editData)}
          isSaving={isSaving}
        >
          <FormField label="Certificate Title *" name="title" value={editData.title as string} onChange={(v) => setEditData({...editData, title: v})} placeholder="AWS Certified Developer" />
          <FormField label="Issuing Organization *" name="organization" value={editData.organization as string} onChange={(v) => setEditData({...editData, organization: v})} placeholder="Amazon Web Services" />
          <FormField label="Issue Date" name="issuedDate" type="date" value={editData.issuedDate as string} onChange={(v) => setEditData({...editData, issuedDate: v})} />
          <FormField label="Skills" name="skills" value={editData.skills as string} onChange={(v) => setEditData({...editData, skills: v})} placeholder="AWS, Cloud Computing" />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={editData.description as string || ''}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              rows={3}
              placeholder="Describe the certification..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>
        </Modal>
      )}

      {/* Project Modal */}
      {activeModal === 'project' && (
        <Modal
          title="Add Project"
          onClose={() => setActiveModal(null)}
          onSave={() => handleSave('project', editData)}
          isSaving={isSaving}
        >
          <FormField label="Project Title *" name="name" value={editData.name as string} onChange={(v) => setEditData({...editData, name: v})} placeholder="My Awesome Project" />
          <FormField label="Project URL" name="url" value={editData.url as string} onChange={(v) => setEditData({...editData, url: v})} placeholder="https://myproject.com" />
          <FormField label="Technologies" name="technologies" value={(editData.technologies as string[])?.join(', ') || ''} onChange={(v) => setEditData({...editData, technologies: v.split(',').map((t: string) => t.trim())})} placeholder="React, Node.js, MongoDB" />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={editData.description as string || ''}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              rows={4}
              placeholder="Describe your project..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ===== HELPER COMPONENTS =====

interface ProfileSectionProps {
  title: string;
  icon: string;
  onEdit: () => void;
  imageSrc?: string;
  children: React.ReactNode;
}

function ProfileSection({ title, icon, onEdit, imageSrc, children }: ProfileSectionProps) {
  const icons: Record<string, React.ReactNode> = {
    user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    document: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    skills: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
    briefcase: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
    academic: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />,
    badge: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
    folder: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />,
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {icons[icon]}
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <button
              onClick={onEdit}
              className="ml-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
          <div>{children}</div>
        </div>
        {imageSrc && (
          <img
            src={imageSrc}
            alt={title}
            className="w-28 h-24 object-cover rounded-lg ml-4 hidden sm:block"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
      </div>
    </div>
  );
}

// Modal Component
interface ModalProps {
  title: string;
  onClose: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  hideFooter?: boolean;
  children: React.ReactNode;
}

function Modal({ title, onClose, onSave, isSaving, hideFooter, children }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
        {!hideFooter && (
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Form Field Component
interface FormFieldProps {
  label: string;
  name: string;
  value: string | undefined;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}

function FormField({ label, name, value, onChange, type = 'text', placeholder }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
    </div>
  );
}

// Resume Uploader Component
interface ResumeUploaderProps {
  userId: string;
  onSuccess: () => void;
}

function ResumeUploader({ userId, onSuccess }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await fetch(`/api/users/${userId}/resume`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Failed to upload resume');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
          id="resume-input"
        />
        <label
          htmlFor="resume-input"
          className="cursor-pointer flex flex-col items-center"
        >
          <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            {file ? file.name : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (max 5MB)</p>
        </label>
      </div>
      
      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      )}
      
      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
      >
        {isUploading ? 'Uploading...' : 'Upload Resume'}
      </button>
    </div>
  );
}
