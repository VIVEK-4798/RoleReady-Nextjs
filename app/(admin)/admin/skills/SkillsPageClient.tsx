/**
 * Skills Page Client Component
 * 
 * Handles client-side state for skills management.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Type export for parent component
export interface Skill {
  _id: string;
  name: string;
  normalizedName: string;
  domain: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const domains = [
  { value: 'technical', label: 'Technical' },
  { value: 'soft-skills', label: 'Soft Skills' },
  { value: 'tools', label: 'Tools' },
  { value: 'frameworks', label: 'Frameworks' },
  { value: 'languages', label: 'Languages' },
  { value: 'databases', label: 'Databases' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'other', label: 'Other' },
];

interface SkillsPageClientProps {
  initialSkills: Skill[];
}

export default function SkillsPageClient({ initialSkills }: SkillsPageClientProps) {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [domainFilter, setDomainFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    domain: 'other',
    description: '',
  });

  // Filter skills
  const filteredSkills = skills.filter((skill) => {
    if (filter === 'active' && !skill.isActive) return false;
    if (filter === 'inactive' && skill.isActive) return false;
    if (domainFilter && skill.domain !== domainFilter) return false;
    if (search && !skill.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Open modal for create/edit
  const openModal = (skill?: Skill) => {
    if (skill) {
      setEditingSkill(skill);
      setFormData({
        name: skill.name,
        domain: skill.domain,
        description: skill.description || '',
      });
    } else {
      setEditingSkill(null);
      setFormData({ name: '', domain: 'other', description: '' });
    }
    setError('');
    setIsModalOpen(true);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url = editingSkill 
        ? `/api/admin/skills/${editingSkill._id}`
        : '/api/admin/skills';
      
      const res = await fetch(url, {
        method: editingSkill ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save skill');
      }

      router.refresh();
      setIsModalOpen(false);
      
      if (editingSkill) {
        setSkills((prev) => 
          prev.map((s) => s._id === editingSkill._id ? { ...s, ...formData } : s)
        );
      } else {
        const newSkill: Skill = {
          _id: data.data._id,
          name: data.data.name,
          normalizedName: data.data.normalizedName,
          domain: data.data.domain,
          description: data.data.description,
          isActive: data.data.isActive !== false,
          createdAt: data.data.createdAt,
          updatedAt: data.data.updatedAt,
        };
        setSkills((prev) => [...prev, newSkill]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle active status
  const toggleActive = async (skill: Skill) => {
    try {
      const res = await fetch(`/api/admin/skills/${skill._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !skill.isActive }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update skill');
      }

      setSkills((prev) =>
        prev.map((s) => s._id === skill._id ? { ...s, isActive: !s.isActive } : s)
      );
    } catch (err) {
      console.error('Error toggling skill:', err);
      setError('Failed to update skill status');
    }
  };

  return (
    <>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="search"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
          />
        </div>
        
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
        >
          <option value="">All Domains</option>
          {domains.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>

        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-[#5693C1] text-white rounded-lg hover:bg-[#4a80b0] transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:ring-offset-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Skill
        </button>
      </div>

      {/* Skills Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSkills.map((skill) => (
                <tr key={skill._id} className={!skill.isActive ? 'opacity-50' : ''}>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {skill.name}
                      </p>
                      {skill.description && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {skill.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      {domains.find((d) => d.value === skill.domain)?.label || skill.domain}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(skill)}
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        skill.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {skill.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openModal(skill)}
                      className="text-[#5693C1] hover:text-[#4a80b0] font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSkills.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No skills found matching your criteria.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingSkill ? 'Edit Skill' : 'Add New Skill'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                  placeholder="e.g., React, Python, AWS"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain
                </label>
                <select
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                >
                  {domains.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                  placeholder="Optional description..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#5693C1] text-white rounded-lg hover:bg-[#4a80b0] transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:ring-offset-2"
                >
                  {isLoading ? 'Saving...' : editingSkill ? 'Save Changes' : 'Create Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}