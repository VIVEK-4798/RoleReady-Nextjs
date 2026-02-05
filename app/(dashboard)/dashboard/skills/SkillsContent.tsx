/**
 * Skills Content Component
 * 
 * Client component for viewing and managing user skills.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks';
import { SkeletonPage, ProgressBar, useToast } from '@/components/ui';

interface UserSkill {
  id: string;
  skillId: string;
  name: string;
  domain: string;
  category: string;
  proficiency: number;
  yearsOfExperience?: number;
  isVerified: boolean;
  source: string;
}

interface AvailableSkill {
  id: string;
  name: string;
  domain: string;
  category: string;
}

const DOMAINS = [
  { value: 'all', label: 'All Domains' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'database', label: 'Database' },
  { value: 'devops', label: 'DevOps' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'design', label: 'Design' },
  { value: 'soft-skills', label: 'Soft Skills' },
  { value: 'other', label: 'Other' },
];

export default function SkillsContent() {
  const { user, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<AvailableSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');

  const fetchSkills = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const params = new URLSearchParams();
      if (selectedDomain !== 'all') {
        params.set('domain', selectedDomain);
      }
      
      const response = await fetch(`/api/users/${user.id}/skills?${params}`);
      const data = await response.json();
      
      if (data.success) {
        // Handle response format: data.data.skills or data.skills
        const skillsData = data.data?.skills || data.skills || [];
        setSkills(Array.isArray(skillsData) ? skillsData : []);
      } else {
        setSkills([]);
      }
    } catch (err) {
      console.error('Failed to fetch skills:', err);
      setError('Failed to load skills');
      setSkills([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, selectedDomain]);

  const fetchAvailableSkills = useCallback(async () => {
    try {
      const response = await fetch('/api/skills?limit=1000&active=true');
      const data = await response.json();
      
      if (data.success) {
        // paginatedResponse returns data directly in the data field
        const skillsData = data.data || [];
        setAvailableSkills(Array.isArray(skillsData) ? skillsData : []);
      } else {
        setAvailableSkills([]);
      }
    } catch (err) {
      console.error('Failed to fetch available skills:', err);
      setAvailableSkills([]);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchSkills();
      fetchAvailableSkills();
    }
  }, [authLoading, user?.id, fetchSkills, fetchAvailableSkills]);

  const handleAddSkill = async (skillId: string, proficiency: number) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/users/${user.id}/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId, proficiency }),
      });

      const data = await response.json();

      if (data.success) {
        fetchSkills();
        setShowAddModal(false);
        addToast('success', 'Skill added successfully');
      } else {
        setError(data.error || 'Failed to add skill');
        addToast('error', data.error || 'Failed to add skill');
      }
    } catch (err) {
      console.error('Failed to add skill:', err);
      setError('Failed to add skill');
      addToast('error', 'Failed to add skill');
    }
  };

  const handleUpdateProficiency = async (userSkillId: string, proficiency: number) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/users/${user.id}/skills/${userSkillId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proficiency }),
      });

      const data = await response.json();

      if (data.success) {
        setSkills(prev => prev.map(s => 
          s.id === userSkillId ? { ...s, proficiency } : s
        ));
        addToast('success', 'Proficiency updated');
      }
    } catch (err) {
      console.error('Failed to update skill:', err);
      addToast('error', 'Failed to update proficiency');
    }
  };

  const handleRemoveSkill = async (userSkillId: string) => {
    if (!user?.id) return;
    
    if (!confirm('Are you sure you want to remove this skill?')) return;

    try {
      const response = await fetch(`/api/users/${user.id}/skills/${userSkillId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setSkills(prev => prev.filter(s => s.id !== userSkillId));
        addToast('success', 'Skill removed');
      }
    } catch (err) {
      console.error('Failed to remove skill:', err);
      addToast('error', 'Failed to remove skill');
    }
  };

  // Filter skills based on search
  const filteredSkills = (skills || []).filter(skill =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group skills by domain
  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    const domain = skill.domain || 'other';
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(skill);
    return acc;
  }, {} as Record<string, UserSkill[]>);

  if (authLoading || isLoading) {
    return <SkeletonPage />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Skills</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {skills?.length || 0} skills added • {skills?.filter(s => s.isVerified).length || 0} verified
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:shadow-md active:scale-95 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Skill
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {DOMAINS.map(domain => (
            <option key={domain.value} value={domain.value}>
              {domain.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Skills Display */}
      {filteredSkills.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No skills added yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Start by adding skills you have or upload your resume to auto-import.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Add Your First Skill
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSkills).map(([domain, domainSkills]) => (
            <div key={domain} className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                {domain.replace('-', ' ')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {domainSkills.map(skill => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onUpdateProficiency={handleUpdateProficiency}
                    onRemove={handleRemoveSkill}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddModal && (
        <AddSkillModal
          availableSkills={availableSkills.filter(
            as => !skills.some(s => s.skillId === as.id)
          )}
          onAdd={handleAddSkill}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

// Skill Card Component
interface SkillCardProps {
  skill: UserSkill;
  onUpdateProficiency: (id: string, proficiency: number) => void;
  onRemove: (id: string) => void;
}

function SkillCard({ skill, onUpdateProficiency, onRemove }: SkillCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [proficiency, setProficiency] = useState(skill.proficiency);

  const handleSave = () => {
    onUpdateProficiency(skill.id, proficiency);
    setIsEditing(false);
  };

  const getProficiencyLabel = (value: number) => {
    if (value >= 90) return 'Expert';
    if (value >= 70) return 'Advanced';
    if (value >= 50) return 'Intermediate';
    if (value >= 30) return 'Beginner';
    return 'Learning';
  };

  const getProficiencyColor = (value: number) => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 70) return 'bg-blue-500';
    if (value >= 50) return 'bg-yellow-500';
    if (value >= 30) return 'bg-orange-500';
    return 'bg-gray-500';
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 hover:shadow-md group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            {skill.name}
            {skill.isVerified && (
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {skill.category}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => onRemove(skill.id)}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Proficiency: {proficiency}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={proficiency}
              onChange={(e) => setProficiency(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
            >
              Save
            </button>
            <button
              onClick={() => {
                setProficiency(skill.proficiency);
                setIsEditing(false);
              }}
              className="flex-1 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">
              {getProficiencyLabel(skill.proficiency)}
            </span>
            <span className="text-gray-900 dark:text-white font-medium">
              {skill.proficiency}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ease-out ${getProficiencyColor(skill.proficiency)}`}
              style={{ width: `${skill.proficiency}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Add Skill Modal Component
interface AddSkillModalProps {
  availableSkills: AvailableSkill[];
  onAdd: (skillId: string, proficiency: number) => void;
  onClose: () => void;
}

function AddSkillModal({ availableSkills, onAdd, onClose }: AddSkillModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<AvailableSkill | null>(null);
  const [proficiency, setProficiency] = useState(50);
  const [customSkillName, setCustomSkillName] = useState('');

  const filteredSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    if (selectedSkill) {
      onAdd(selectedSkill.id, proficiency);
    }
    // TODO: Handle custom skill addition
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add Skill
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {!selectedSkill ? (
            <>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a skill..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
                autoFocus
              />

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredSkills.slice(0, 20).map(skill => (
                  <button
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill)}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {skill.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {skill.domain} • {skill.category}
                    </div>
                  </button>
                ))}

                {filteredSkills.length === 0 && searchQuery && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      No matching skills found
                    </p>
                    <button
                      onClick={() => {
                        setCustomSkillName(searchQuery);
                        // TODO: Create custom skill flow
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      + Add &quot;{searchQuery}&quot; as new skill
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {selectedSkill.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {selectedSkill.domain} • {selectedSkill.category}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Proficiency Level: {proficiency}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={proficiency}
                  onChange={(e) => setProficiency(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Beginner</span>
                  <span>Intermediate</span>
                  <span>Expert</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          {selectedSkill ? (
            <>
              <button
                onClick={() => setSelectedSkill(null)}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Add Skill
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
