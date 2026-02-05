'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks';
import { SkeletonPage, useToast } from '@/components/ui';
import { Modal } from './components/Modal';
import { FormField } from './components/FormField';
import { ResumeUploader } from './components/ResumeUploader';
import { AboutSection } from './components/sections/AboutSection';
import { ResumeSection } from './components/sections/ResumeSection';
import { SkillsSection } from './components/sections/SkillsSection';
import { ExperienceSection } from './components/sections/ExperienceSection';
import { EducationSection } from './components/sections/EducationSection';
import { CertificatesSection } from './components/sections/CertificatesSection';
import { ProjectsSection } from './components/sections/ProjectsSection';

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
          // Map form fields to API fields
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
      <AboutSection
        bio={profile?.profile?.bio}
        onEdit={() => {
          setEditData({ bio: profile?.profile?.bio || '' });
          setActiveModal('about');
        }}
      />

      {/* ===== RESUME SECTION ===== */}
      <ResumeSection
        resume={resume}
        onEdit={() => setActiveModal('resume')}
        formatDate={formatDate}
      />

      {/* ===== SKILLS SECTION ===== */}
      <SkillsSection
        skills={skills}
        onEdit={() => setActiveModal('skills')}
        getValidationBadge={getValidationBadge}
        getLevelColor={getLevelColor}
      />

      {/* ===== WORK EXPERIENCE SECTION ===== */}
      <ExperienceSection
        experiences={profile?.profile?.experience}
        onEdit={() => {
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
      />

      {/* ===== EDUCATION SECTION ===== */}
      <EducationSection
        education={profile?.profile?.education}
        onEdit={() => {
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
      />

      {/* ===== CERTIFICATES SECTION ===== */}
      <CertificatesSection
        certificates={profile?.profile?.certificates}
        onAdd={() => {
          setEditData({});
          setActiveModal('certificate');
        }}
        onEditCertificate={(cert) => {
          setEditData({
            title: cert.name,
            organization: cert.issuer,
            issuedDate: cert.issueDate,
            expiryDate: cert.expiryDate,
            url: cert.url,
          });
          setActiveModal('certificate');
        }}
      />

      {/* ===== PROJECTS SECTION ===== */}
      <ProjectsSection
        projects={profile?.profile?.projects}
        onAdd={() => {
          setEditData({});
          setActiveModal('project');
        }}
        onEditProject={(proj) => {
          setEditData({
            _id: proj._id,
            name: proj.name,
            description: proj.description,
            url: proj.url,
            githubUrl: proj.githubUrl,
            technologies: proj.technologies,
            startDate: proj.startDate,
            endDate: proj.endDate,
            isOngoing: proj.isOngoing,
          });
          setActiveModal('project');
        }}
      />

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
