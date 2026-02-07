/**
 * Admin Job Categories Client Component
 * 
 * Modern client-side component for managing job categories with advanced features.
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AdminDataTable } from '@/components/admin';

interface Category {
  _id: string;
  name: string;
  colorClass: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  jobCount?: number;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCategories: number;
  limit: number;
}

export default function AdminJobCategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    colorClass: '#8B5CF6',
    description: '',
    isActive: true,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const limit = 10;

  // Fetch categories with debouncing
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        status,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/admin/categories/jobs?${params}`);
      const data = await response.json();

      if (data.success) {
        setCategories(data.data.categories);
        setTotal(data.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [fetchCategories]);

  // Handle create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Category name is required');
      return;
    }

    try {
      const url = editingCategory
        ? `/api/admin/categories/jobs/${editingCategory._id}`
        : '/api/admin/categories/jobs';
      
      const method = editingCategory ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: '', colorClass: '#8B5CF6', description: '', isActive: true });
        fetchCategories();
        alert(data.message);
      } else {
        alert(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/categories/jobs/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchCategories();
        alert(data.message);
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/categories/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        fetchCategories();
      } else {
        alert(data.error || 'Status update failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    }
  };

  // Handle edit
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      colorClass: category.colorClass || '#8B5CF6',
      description: category.description || '',
      isActive: category.isActive,
    });
    setShowModal(true);
  };

  // Bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) {
      alert('Please select categories first');
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} ${selectedIds.length} category(s)?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await fetch('/api/admin/categories/jobs/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: selectedIds }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedIds([]);
        fetchCategories();
        alert(data.message);
      } else {
        alert(data.error || 'Bulk action failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.length === categories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(categories.map(cat => cat._id));
    }
  };

  // Toggle single selection
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(catId => catId !== id)
        : [...prev, id]
    );
  };

  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Predefined colors for quick selection (purple theme)
  const colorPalette = [
    '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B',
    '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  // Table columns
  const columns = useMemo(() => [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.length === categories.length && categories.length > 0}
          onChange={toggleSelectAll}
          className="w-4 h-4 text-[#5693C1] rounded border-gray-300 focus:ring-[#5693C1] focus:ring-2"
        />
      ),
      render: (category: Category) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(category._id)}
          onChange={() => toggleSelect(category._id)}
          className="w-4 h-4 text-[#5693C1] rounded border-gray-300 focus:ring-[#5693C1] focus:ring-2"
        />
      ),
      width: 'w-12',
    },
    {
      key: 'name',
      label: (
        <button 
          onClick={() => handleSort('name')}
          className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
        >
          Category Name
          <svg className={`w-3 h-3 ${sortBy === 'name' ? 'text-[#5693C1]' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
            {sortBy === 'name' && sortOrder === 'asc' ? (
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            )}
          </svg>
        </button>
      ),
      render: (category: Category) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-white font-semibold text-sm"
            style={{ backgroundColor: category.colorClass }}
          >
            {category.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-medium text-gray-900 block">{category.name}</span>
            {category.description && (
              <span className="text-xs text-gray-500 truncate max-w-xs">{category.description}</span>
            )}
          </div>
        </div>
      ),
      width: 'w-64',
    },
    {
      key: 'color',
      label: 'Color',
      render: (category: Category) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded border border-gray-200"
              style={{ backgroundColor: category.colorClass }}
            />
            <span className="text-sm text-gray-700 font-mono">{category.colorClass}</span>
          </div>
          <div className="text-xs text-gray-500">
            {category.jobCount || 0} jobs
          </div>
        </div>
      ),
      width: 'w-48',
    },
    {
      key: 'status',
      label: 'Status',
      render: (category: Category) => (
        <div className="space-y-1">
          <button
            onClick={() => handleToggleStatus(category._id, category.isActive)}
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              category.isActive
                ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'
                : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${category.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            {category.isActive ? 'Active' : 'Inactive'}
          </button>
          <p className="text-xs text-gray-500">
            Updated: {new Date(category.updatedAt).toLocaleDateString()}
          </p>
        </div>
      ),
      width: 'w-40',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (category: Category) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleEdit(category)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(category._id)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
      width: 'w-24',
    },
  ], [selectedIds, categories, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-[#5693C1]/10 to-purple-400/10 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Job Categories</h1>
            <p className="mt-2 text-gray-600">
              Organize and manage job listings with color-coded categories
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', colorClass: '#8B5CF6', description: '', isActive: true });
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Categories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {categories.filter(c => c.isActive).length}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {categories.reduce((sum, cat) => sum + (cat.jobCount || 0), 0)}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Jobs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {categories.length > 0 
                  ? Math.round(categories.reduce((sum, cat) => sum + (cat.jobCount || 0), 0) / categories.length)
                  : 0}
              </p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search */}
          <div className="md:col-span-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search categories by name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Sort */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-gray-900"
            >
              <option value="name">Name A-Z</option>
              <option value="createdAt">Newest First</option>
              <option value="updatedAt">Recently Updated</option>
              <option value="jobCount">Most Jobs</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="md:col-span-2">
            <button
              onClick={() => {
                setSearch('');
                setStatus('all');
                setSortBy('name');
                setPage(1);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">Clear Filters</span>
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {selectedIds.length} categories selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1.5 text-sm font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-1.5 text-sm font-medium bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1.5 text-sm font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          // Loading Skeleton
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-64 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          // Empty State
          <div className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-500 mb-6">
              {search ? 'Try adjusting your search or filters' : 'Get started by creating your first category'}
            </p>
            <button
              onClick={() => {
                setEditingCategory(null);
                setFormData({ name: '', colorClass: '#8B5CF6', description: '', isActive: true });
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add First Category
            </button>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width || ''}`}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                      {columns.map((column) => (
                        <td key={column.key} className="px-4 py-3">
                          {column.render(category)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                <span className="font-medium">{total}</span> results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm font-medium text-gray-900">
                  Page {page} of {Math.ceil(total / limit)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * limit >= total}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Name */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-gray-900 placeholder-gray-500"
                    placeholder="e.g., Software Engineering"
                  />
                </div>

                {/* Color Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category Color *
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div 
                        className="w-12 h-12 rounded-xl border-2 border-gray-300"
                        style={{ backgroundColor: formData.colorClass }}
                      />
                      <input
                        type="color"
                        value={formData.colorClass}
                        onChange={(e) => setFormData({ ...formData, colorClass: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.colorClass}
                      onChange={(e) => setFormData({ ...formData, colorClass: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-gray-900 placeholder-gray-500 font-mono"
                      placeholder="#8B5CF6"
                    />
                  </div>

                  {/* Color Palette */}
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {colorPalette.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, colorClass: color })}
                        className={`w-8 h-8 rounded border-2 ${
                          formData.colorClass === color 
                            ? 'border-gray-900' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-gray-900 placeholder-gray-500"
                    placeholder="Optional description of this category..."
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.isActive}
                        onChange={() => setFormData({ ...formData, isActive: true })}
                        className="w-4 h-4 text-[#5693C1] border-gray-300 focus:ring-[#5693C1]"
                      />
                      <span className="text-gray-900">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!formData.isActive}
                        onChange={() => setFormData({ ...formData, isActive: false })}
                        className="w-4 h-4 text-[#5693C1] border-gray-300 focus:ring-[#5693C1]"
                      />
                      <span className="text-gray-900">Inactive</span>
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="pt-4 border-t border-gray-200 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingCategory(null);
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}