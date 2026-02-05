/**
 * Roles Page Client Component
 * 
 * Handles client-side state for roles and benchmarks management.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Type exports for parent component
export interface Skill {
  _id: string;
  name: string;
  domain: string;
}

export interface Benchmark {
  _id: string;
  skillId: Skill;
  importance: 'required' | 'optional';
  weight: number;
  requiredLevel: number;
}

interface Role {
  _id: string;
  title: string;
  normalizedTitle: string;
  description: string;
  category: string;
  isActive: boolean;
  benchmarks: Benchmark[];
  createdAt: string;
  updatedAt: string;
}

const categories = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'product', label: 'Product' },
  { value: 'data', label: 'Data' },
  { value: 'devops', label: 'DevOps' },
  { value: 'management', label: 'Management' },
  { value: 'other', label: 'Other' },
];

interface RolesPageClientProps {
  initialRoles: Role[];
  allSkills: Skill[];
}

export default function RolesPageClient({ initialRoles, allSkills }: RolesPageClientProps) {
  const router = useRouter();
  const [roles, setRoles] = useState(initialRoles);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isBenchmarksModalOpen, setIsBenchmarksModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Role form state
  const [roleForm, setRoleForm] = useState({
    name: '', // Using 'name' to match API
    colorClass: 'bg-blue-500',
    description: '',
  });

  // Benchmarks editing state
  const [editingBenchmarks, setEditingBenchmarks] = useState<Benchmark[]>([]);

  // Filter roles
  const filteredRoles = roles.filter((role) => {
    if (filter === 'active' && !role.isActive) return false;
    if (filter === 'inactive' && role.isActive) return false;
    if (categoryFilter && role.category !== categoryFilter) return false;
    if (search && !role.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Open role modal for create/edit
  const openRoleModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({
        name: role.title, // title in UI = name in API
        colorClass: role.category,
        description: role.description,
      });
    } else {
      setEditingRole(null);
      setRoleForm({ name: '', colorClass: 'bg-blue-500', description: '' });
    }
    setError('');
    setIsRoleModalOpen(true);
  };

  // Open benchmarks modal
  const openBenchmarksModal = (role: Role) => {
    setEditingRole(role);
    setEditingBenchmarks(role.benchmarks.map((b) => ({ ...b })));
    setError('');
    setIsBenchmarksModalOpen(true);
  };

  // Handle role form submit
  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url = editingRole 
        ? `/api/admin/roles/${editingRole._id}`
        : '/api/admin/roles';
      
      const res = await fetch(url, {
        method: editingRole ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save role');
      }

      router.refresh();
      setIsRoleModalOpen(false);
      
      if (editingRole) {
        setRoles((prev) => 
          prev.map((r) => r._id === editingRole._id 
            ? { ...r, title: roleForm.name, category: roleForm.colorClass, description: roleForm.description } 
            : r
          )
        );
      } else {
        // New role - map API response to UI format
        const newRole = {
          _id: data.data._id,
          title: data.data.name,
          normalizedTitle: data.data.name.toLowerCase().replace(/\s+/g, '-'),
          category: data.data.colorClass || 'bg-blue-500',
          description: data.data.description || '',
          isActive: data.data.isActive !== false,
          benchmarks: [],
          createdAt: data.data.createdAt,
          updatedAt: data.data.updatedAt,
        };
        setRoles((prev) => [...prev, newRole]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle role active status
  const toggleActive = async (role: Role) => {
    try {
      const res = await fetch(`/api/admin/roles/${role._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !role.isActive }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update role');
      }

      setRoles((prev) =>
        prev.map((r) => r._id === role._id ? { ...r, isActive: !r.isActive } : r)
      );
    } catch (err) {
      console.error('Error toggling role:', err);
    }
  };

  // Add new benchmark to editing list
  const addBenchmark = () => {
    if (allSkills.length === 0) return;
    
    // Find a skill not already in benchmarks
    const usedSkillIds = editingBenchmarks.map((b) => b.skillId._id);
    const availableSkill = allSkills.find((s) => !usedSkillIds.includes(s._id));
    
    if (!availableSkill) {
      setError('All available skills are already added as benchmarks');
      return;
    }

    setEditingBenchmarks((prev) => [
      ...prev,
      {
        _id: `new-${Date.now()}`,
        skillId: availableSkill,
        importance: 'optional',
        weight: 1,
        requiredLevel: 3,
      },
    ]);
  };

  // Update benchmark in editing list
  const updateBenchmark = (index: number, updates: Partial<Benchmark>) => {
    setEditingBenchmarks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, ...updates } : b))
    );
  };

  // Change benchmark skill
  const changeBenchmarkSkill = (index: number, skillId: string) => {
    const skill = allSkills.find((s) => s._id === skillId);
    if (skill) {
      updateBenchmark(index, { skillId: skill });
    }
  };

  // Remove benchmark from editing list
  const removeBenchmark = (index: number) => {
    setEditingBenchmarks((prev) => prev.filter((_, i) => i !== index));
  };

  // Save benchmarks
  const handleBenchmarksSave = async () => {
    if (!editingRole) return;
    
    setIsLoading(true);
    setError('');

    try {
      // Validate weights
      const totalWeight = editingBenchmarks.reduce((sum, b) => sum + b.weight, 0);
      if (totalWeight > 100) {
        throw new Error('Total weight cannot exceed 100');
      }

      const benchmarksPayload = editingBenchmarks.map((b) => ({
        skillId: b.skillId._id,
        importance: b.importance,
        weight: b.weight,
        requiredLevel: b.requiredLevel,
      }));

      const res = await fetch(`/api/admin/roles/${editingRole._id}/benchmarks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ benchmarks: benchmarksPayload }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save benchmarks');
      }

      router.refresh();
      setIsBenchmarksModalOpen(false);
      
      // Update local state
      setRoles((prev) =>
        prev.map((r) => 
          r._id === editingRole._id 
            ? { ...r, benchmarks: editingBenchmarks }
            : r
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Get available skills for benchmark selection
  const getAvailableSkills = (currentBenchmark: Benchmark) => {
    const usedSkillIds = editingBenchmarks
      .filter((b) => b._id !== currentBenchmark._id)
      .map((b) => b.skillId._id);
    return allSkills.filter((s) => !usedSkillIds.includes(s._id) || s._id === currentBenchmark.skillId._id);
  };

  return (
    <>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="search"
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>

        <button
          onClick={() => openRoleModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Role
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRoles.map((role) => (
          <div
            key={role._id}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${
              !role.isActive ? 'opacity-50' : ''
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {role.title}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded mt-1 inline-block">
                    {categories.find((c) => c.value === role.category)?.label || role.category}
                  </span>
                </div>
                <button
                  onClick={() => toggleActive(role)}
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    role.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                  }`}
                >
                  {role.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              {role.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {role.description}
                </p>
              )}

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Benchmarks</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {role.benchmarks.length} skills
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {role.benchmarks.slice(0, 5).map((b) => (
                    <span
                      key={b._id}
                      className={`text-xs px-2 py-0.5 rounded ${
                        b.importance === 'required'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {typeof b.skillId === 'object' && b.skillId?.name ? b.skillId.name : 'Unknown Skill'}
                    </span>
                  ))}
                  {role.benchmarks.length > 5 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{role.benchmarks.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openRoleModal(role)}
                  className="flex-1 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  Edit Role
                </button>
                <button
                  onClick={() => openBenchmarksModal(role)}
                  className="flex-1 px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                >
                  Benchmarks
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No roles found matching your criteria.
        </div>
      )}

      {/* Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingRole ? 'Edit Role' : 'Add New Role'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRoleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Frontend Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color Theme
                </label>
                <select
                  value={roleForm.colorClass}
                  onChange={(e) => setRoleForm({ ...roleForm, colorClass: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="bg-blue-500">Blue</option>
                  <option value="bg-green-500">Green</option>
                  <option value="bg-purple-500">Purple</option>
                  <option value="bg-red-500">Red</option>
                  <option value="bg-yellow-500">Yellow</option>
                  <option value="bg-indigo-500">Indigo</option>
                  <option value="bg-pink-500">Pink</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Optional role description..."
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : editingRole ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Benchmarks Modal */}
      {isBenchmarksModalOpen && editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Benchmarks: {editingRole.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Configure required skills and their weights for this role.
              </p>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6">
              {editingBenchmarks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No benchmarks defined. Add skills to define requirements.
                </div>
              ) : (
                <div className="space-y-4">
                  {editingBenchmarks.map((benchmark, index) => (
                    <div
                      key={benchmark._id}
                      className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="grid grid-cols-12 gap-4">
                        {/* Skill select */}
                        <div className="col-span-4">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Skill
                          </label>
                          <select
                            value={benchmark.skillId._id}
                            onChange={(e) => changeBenchmarkSkill(index, e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            {getAvailableSkills(benchmark).map((s) => (
                              <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Importance */}
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Importance
                          </label>
                          <select
                            value={benchmark.importance}
                            onChange={(e) => updateBenchmark(index, { importance: e.target.value as 'required' | 'optional' })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="required">Required</option>
                            <option value="optional">Optional</option>
                          </select>
                        </div>

                        {/* Weight */}
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Weight (1-10)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={benchmark.weight}
                            onChange={(e) => updateBenchmark(index, { weight: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)) })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>

                        {/* Required Level */}
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Level (1-5)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={benchmark.requiredLevel}
                            onChange={(e) => updateBenchmark(index, { requiredLevel: Math.min(5, Math.max(1, parseInt(e.target.value) || 1)) })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>

                        {/* Delete */}
                        <div className="col-span-2 flex items-end">
                          <button
                            onClick={() => removeBenchmark(index)}
                            className="w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={addBenchmark}
                className="mt-4 w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-lg hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                + Add Benchmark
              </button>

              {/* Weight summary */}
              {editingBenchmarks.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700 dark:text-blue-300">Total Weight:</span>
                    <span className={`font-medium ${
                      editingBenchmarks.reduce((sum, b) => sum + b.weight, 0) > 100
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-blue-700 dark:text-blue-300'
                    }`}>
                      {editingBenchmarks.reduce((sum, b) => sum + b.weight, 0)} / 100 max
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-blue-700 dark:text-blue-300">Required Skills:</span>
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      {editingBenchmarks.filter((b) => b.importance === 'required').length}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button
                onClick={() => setIsBenchmarksModalOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBenchmarksSave}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Benchmarks'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
