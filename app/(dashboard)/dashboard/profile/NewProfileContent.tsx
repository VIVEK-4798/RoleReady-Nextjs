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
  name: string;
  issuer?: string;
  issueDate?: Date | string;
  expiryDate?: Date | string;
  url?: string;
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
            name: data.title,
            issuer: data.organization,
            issueDate: data.issuedDate,
            expiryDate: data.expiryDate,
            url: data.url,
          };
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
      return { icon: '🎓', label: 'Validated', className: 'bg-blue-100 text-blue-700 border border-blue-300' };
    }
    if (skill.validationStatus === 'rejected') {
      return { icon: '⚠️', label: 'Rejected', className: 'bg-yellow-100 text-yellow-700 border border-yellow-300' };
    }
    if (skill.source === 'resume') {
      return { icon: '📄', label: 'Resume', className: 'bg-purple-100 text-purple-700 border border-purple-300' };
    }
    return { icon: '✋', label: 'Self', className: 'bg-gray-100 text-gray-600 border border-gray-300' };
  };

  // Get level color
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-blue-600';
      case 'intermediate': return 'text-purple-600';
      case 'advanced': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (authLoading || isLoading) {
    return <SkeletonPage />;
  }

  const primaryEducation = profile?.profile?.education?.[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6">
      {/* ===== PROFILE HEADER ===== */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg border-4 border-white">
              {profile?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            {/* Info */}
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {profile?.name || 'User Name'}
              </h2>
              <p className="text-gray-500">
                @{profile?.email?.split('@')[0] || 'username'}
              </p>
              {primaryEducation?.institution && (
                <p className="text-sm text-gray-500 mt-1">
                  {primaryEducation.institution}
                </p>
              )}
              
              {/* Progress Bar */}
              <div className="mt-3 w-32">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500">Profile</span>
                  <span className="text-xs font-medium text-blue-600">{progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: '#5693C1'
                    }}
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
            className="px-4 py-2 text-white rounded-lg font-medium transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
            style={{ backgroundColor: '#5693C1' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      {/* ===== ABOUT SECTION ===== */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">About</h3>
          <button
            onClick={() => {
              setEditData({ bio: profile?.profile?.bio || '' });
              setActiveModal('about');
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Edit
          </button>
        </div>
        {profile?.profile?.bio ? (
          <p className="text-gray-700 whitespace-pre-line">{profile.profile.bio}</p>
        ) : (
          <p className="text-gray-500 italic">No bio added yet</p>
        )}
      </div>

      {/* ===== RESUME SECTION ===== */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Resume</h3>
          <button
            onClick={() => setActiveModal('resume')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {resume?.hasResume ? 'Update' : 'Upload'}
          </button>
        </div>
        {resume?.hasResume ? (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{resume.fileName}</p>
              {resume.uploadedAt && (
                <p className="text-sm text-gray-500">Uploaded: {formatDate(resume.uploadedAt)}</p>
              )}
            </div>
            <a
              href={`/api/users/${user?.id}/resume/download`}
              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              Download
            </a>
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <p className="text-gray-500">No resume uploaded</p>
            <button
              onClick={() => setActiveModal('resume')}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Upload your resume
            </button>
          </div>
        )}
      </div>

      {/* ===== SKILLS SECTION ===== */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
          <button
            onClick={() => setActiveModal('skills')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Manage
          </button>
        </div>
        {skills.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No skills added yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 12).map((skill) => {
              const badge = getValidationBadge(skill);
              return (
                <div key={skill._id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="font-medium text-gray-900">{skill.skillName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
            {skills.length > 12 && (
              <div className="px-3 py-2 text-gray-500 text-sm">
                + {skills.length - 12} more
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== WORK EXPERIENCE SECTION ===== */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
          <button
            onClick={() => {
              const firstExp = profile?.profile?.experience?.[0];
              if (firstExp) {
                setEditData({
                  _id: firstExp._id,
                  company: firstExp.company,
                  title: firstExp.title,
                  location: firstExp.location,
                  startDate: firstExp.startDate,
                  endDate: firstExp.endDate,
                  isCurrent: firstExp.isCurrent,
                  description: firstExp.description,
                  skills: firstExp.skills,
                });
              } else {
                setEditData({});
              }
              setActiveModal('experience');
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {profile?.profile?.experience?.length ? 'Edit' : 'Add'}
          </button>
        </div>
        {profile?.profile?.experience?.length ? (
          <div className="space-y-4">
            {profile.profile.experience.slice(0, 3).map((exp) => (
              <div key={exp._id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{exp.title}</h4>
                  {exp.isCurrent && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-1">{exp.company}</p>
                {exp.location && (
                  <p className="text-sm text-gray-500 mb-2">{exp.location}</p>
                )}
                {exp.description && (
                  <p className="text-sm text-gray-700">{exp.description}</p>
                )}
              </div>
            ))}
            {profile.profile.experience.length > 3 && (
              <p className="text-gray-500 text-center text-sm">
                + {profile.profile.experience.length - 3} more experiences
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No work experience added yet</p>
        )}
      </div>

      {/* ===== EDUCATION SECTION ===== */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Education</h3>
          <button
            onClick={() => {
              const firstEdu = profile?.profile?.education?.[0];
              if (firstEdu) {
                setEditData({
                  _id: firstEdu._id,
                  institution: firstEdu.institution,
                  degree: firstEdu.degree,
                  fieldOfStudy: firstEdu.fieldOfStudy,
                  startDate: firstEdu.startDate,
                  endDate: firstEdu.endDate,
                  grade: firstEdu.grade,
                  description: firstEdu.description,
                });
              } else {
                setEditData({});
              }
              setActiveModal('education');
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {profile?.profile?.education?.length ? 'Edit' : 'Add'}
          </button>
        </div>
        {profile?.profile?.education?.length ? (
          <div className="space-y-4">
            {profile.profile.education.slice(0, 3).map((edu) => (
              <div key={edu._id} className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">{edu.institution}</h4>
                <p className="text-gray-600">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</p>
                {edu.grade && (
                  <p className="text-sm text-gray-500 mt-1">Grade: {edu.grade}</p>
                )}
              </div>
            ))}
            {profile.profile.education.length > 3 && (
              <p className="text-gray-500 text-center text-sm">
                + {profile.profile.education.length - 3} more educations
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No education added yet</p>
        )}
      </div>

      {/* ===== PROJECTS SECTION ===== */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
          <button
            onClick={() => {
              const firstProj = profile?.profile?.projects?.[0];
              if (firstProj) {
                setEditData({
                  _id: firstProj._id,
                  name: firstProj.name,
                  description: firstProj.description,
                  url: firstProj.url,
                  githubUrl: firstProj.githubUrl,
                  technologies: firstProj.technologies,
                  startDate: firstProj.startDate,
                  endDate: firstProj.endDate,
                  isOngoing: firstProj.isOngoing,
                });
              } else {
                setEditData({});
              }
              setActiveModal('project');
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {profile?.profile?.projects?.length ? 'Edit' : 'Add'}
          </button>
        </div>
        {profile?.profile?.projects?.length ? (
          <div className="space-y-4">
            {profile.profile.projects.slice(0, 3).map((proj) => (
              <div key={proj._id} className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">{proj.name}</h4>
                {proj.description && (
                  <p className="text-gray-600 mb-2">{proj.description}</p>
                )}
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {proj.technologies.slice(0, 5).map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                        {tech}
                      </span>
                    ))}
                    {proj.technologies.length > 5 && (
                      <span className="px-2 py-0.5 text-gray-500 text-xs">+{proj.technologies.length - 5}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
            {profile.profile.projects.length > 3 && (
              <p className="text-gray-500 text-center text-sm">
                + {profile.profile.projects.length - 3} more projects
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No projects added yet</p>
        )}
      </div>

      {/* ===== MODALS ===== */}
      {/* About/Header Edit Modal */}
      {(activeModal === 'about' || activeModal === 'header') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeModal === 'about' ? 'Edit About' : 'Edit Profile'}
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {activeModal === 'header' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editData.name as string || ''}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ color: '#000000' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile
                      </label>
                      <input
                        type="tel"
                        value={editData.mobile as string || ''}
                        onChange={(e) => setEditData({...editData, mobile: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ color: '#000000' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Headline
                      </label>
                      <input
                        type="text"
                        value={editData.headline as string || ''}
                        onChange={(e) => setEditData({...editData, headline: e.target.value})}
                        placeholder="e.g., Full Stack Developer"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ color: '#000000' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={editData.location as string || ''}
                        onChange={(e) => setEditData({...editData, location: e.target.value})}
                        placeholder="e.g., Bangalore, India"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ color: '#000000' }}
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    About
                  </label>
                  <textarea
                    value={editData.bio as string || ''}
                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                    rows={5}
                    maxLength={1000}
                    placeholder="Write about yourself..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: '#000000' }}
                  />
                  <p className="text-xs text-gray-500 mt-1">{(editData.bio as string || '').length}/1000</p>
                </div>
                
                {activeModal === 'header' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={editData.linkedinUrl as string || ''}
                        onChange={(e) => setEditData({...editData, linkedinUrl: e.target.value})}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ color: '#000000' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        value={editData.githubUrl as string || ''}
                        onChange={(e) => setEditData({...editData, githubUrl: e.target.value})}
                        placeholder="https://github.com/..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ color: '#000000' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Portfolio URL
                      </label>
                      <input
                        type="url"
                        value={editData.portfolioUrl as string || ''}
                        onChange={(e) => setEditData({...editData, portfolioUrl: e.target.value})}
                        placeholder="https://yoursite.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ color: '#000000' }}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium flex-1 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(activeModal, editData)}
                  disabled={isSaving}
                  className="px-4 py-2 text-white rounded-lg font-medium flex-1 transition-colors disabled:opacity-70"
                  style={{ backgroundColor: '#5693C1' }}
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
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editData._id ? 'Edit Experience' : 'Add Experience'}
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={editData.title as string || ''}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    placeholder="Software Engineer"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={editData.company as string || ''}
                    onChange={(e) => setEditData({...editData, company: e.target.value})}
                    placeholder="Company Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editData.location as string || ''}
                    onChange={(e) => setEditData({...editData, location: e.target.value})}
                    placeholder="City, Country"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={editData.startDate as string || ''}
                      onChange={(e) => setEditData({...editData, startDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ color: '#000000' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={editData.endDate as string || ''}
                      onChange={(e) => setEditData({...editData, endDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ color: '#000000' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editData.description as string || ''}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    rows={3}
                    placeholder="Describe your responsibilities..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: '#000000' }}
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
                  className="px-4 py-2 text-white rounded-lg font-medium flex-1 transition-colors disabled:opacity-70"
                  style={{ backgroundColor: '#5693C1' }}
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
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editData._id ? 'Edit Education' : 'Add Education'}
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institution *
                  </label>
                  <input
                    type="text"
                    value={editData.institution as string || ''}
                    onChange={(e) => setEditData({...editData, institution: e.target.value})}
                    placeholder="University/College Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Degree *
                  </label>
                  <input
                    type="text"
                    value={editData.degree as string || ''}
                    onChange={(e) => setEditData({...editData, degree: e.target.value})}
                    placeholder="Bachelor's, Master's, etc."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field of Study
                  </label>
                  <input
                    type="text"
                    value={editData.fieldOfStudy as string || ''}
                    onChange={(e) => setEditData({...editData, fieldOfStudy: e.target.value})}
                    placeholder="Computer Science, etc."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="month"
                      value={editData.startDate as string || ''}
                      onChange={(e) => setEditData({...editData, startDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ color: '#000000' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="month"
                      value={editData.endDate as string || ''}
                      onChange={(e) => setEditData({...editData, endDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ color: '#000000' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade/CGPA
                  </label>
                  <input
                    type="text"
                    value={editData.grade as string || ''}
                    onChange={(e) => setEditData({...editData, grade: e.target.value})}
                    placeholder="3.8/4.0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: '#000000' }}
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
                  className="px-4 py-2 text-white rounded-lg font-medium flex-1 transition-colors disabled:opacity-70"
                  style={{ backgroundColor: '#5693C1' }}
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
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={editData.name as string || ''}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    placeholder="My Awesome Project"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project URL
                  </label>
                  <input
                    type="url"
                    value={editData.url as string || ''}
                    onChange={(e) => setEditData({...editData, url: e.target.value})}
                    placeholder="https://myproject.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Technologies
                  </label>
                  <input
                    type="text"
                    value={(editData.technologies as string[])?.join(', ') || ''}
                    onChange={(e) => setEditData({...editData, technologies: e.target.value.split(',').map((t: string) => t.trim())})}
                    placeholder="React, Node.js, MongoDB"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editData.description as string || ''}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    rows={4}
                    placeholder="Describe your project..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: '#000000' }}
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
                  onClick={() => handleSave('project', editData)}
                  disabled={isSaving}
                  className="px-4 py-2 text-white rounded-lg font-medium flex-1 transition-colors disabled:opacity-70"
                  style={{ backgroundColor: '#5693C1' }}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}