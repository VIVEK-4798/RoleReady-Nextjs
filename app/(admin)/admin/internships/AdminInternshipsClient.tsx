/**
 * Admin Internships Client Component
 * 
 * Modern, responsive client-side table for managing internships with enhanced UX.
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDataTable } from '@/components/admin';
import { ConfirmationModal } from '@/components/ui';
import toast from 'react-hot-toast';

interface Internship {
  _id: string;
  title: string;
  company: string;
  city: string;
  stipend: string;
  duration: string;
  type: string;
  workDetail: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export default function AdminInternshipsClient() {
  const router = useRouter();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const limit = 10;

  // Fetch internships with debouncing
  const fetchInternships = useCallback(async () => {
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

      const response = await fetch(`/api/admin/internships?${params}`);
      const data = await response.json();

      if (data.success) {
        setInternships(data.data.internships);
        setTotal(data.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching internships:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInternships();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchInternships]);

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) {
      toast.error('Please select internships first');
      return;
    }
    setBulkAction(action);
    setShowBulkModal(true);
  };

  const confirmBulkAction = async () => {
    if (!bulkAction) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/internships/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: bulkAction, ids: selectedIds }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedIds([]);
        fetchInternships();
        toast.success(data.message);
        setShowBulkModal(false);
        setBulkAction(null);
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteInternship = async () => {
    if (!deleteId) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/internships/${deleteId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchInternships();
        toast.success(data.message);
        setShowDeleteModal(false);
        setDeleteId(null);
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.length === internships.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(internships.map((i) => i._id));
    }
  };

  // Toggle single selection
  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Table columns with enhanced design
  const columns = useMemo(() => [
    {
      key: 'select',
      label: (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selectedIds.length === internships.length && internships.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4 text-[#5693C1] rounded border-gray-300 focus:ring-[#5693C1] focus:ring-2"
          />
        </div>
      ),
      render: (internship: Internship) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(internship._id)}
          onChange={() => toggleSelect(internship._id)}
          className="w-4 h-4 text-[#5693C1] rounded border-gray-300 focus:ring-[#5693C1] focus:ring-2"
        />
      ),
      width: 'w-12',
    },
    {
      key: 'company',
      label: (
        <button
          onClick={() => handleSort('company')}
          className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
        >
          Company
          <svg className={`w-3 h-3 ${sortBy === 'company' ? 'text-[#5693C1]' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
            {sortBy === 'company' && sortOrder === 'asc' ? (
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            )}
          </svg>
        </button>
      ),
      render: (internship: Internship) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#5693C1] to-blue-400 flex items-center justify-center text-white font-semibold text-sm">
            {internship.company.charAt(0)}
          </div>
          <span className="font-medium text-gray-900 truncate">{internship.company}</span>
        </div>
      ),
      width: 'w-48',
    },
    {
      key: 'title',
      label: 'Title',
      render: (internship: Internship) => (
        <div className="group">
          <span className="text-gray-900 font-medium group-hover:text-[#5693C1] transition-colors">
            {internship.title}
          </span>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{internship.workDetail}</p>
        </div>
      ),
      width: 'w-64',
    },
    {
      key: 'location',
      label: 'Location',
      render: (internship: Internship) => (
        <div className="flex items-center gap-1 text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{internship.city}</span>
        </div>
      ),
      width: 'w-32',
    },
    {
      key: 'details',
      label: 'Details',
      render: (internship: Internship) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">
              {internship.type}
            </span>
            <span className="text-sm font-medium text-gray-900">{internship.stipend}</span>
          </div>
          <span className="text-xs text-gray-500">{internship.duration}</span>
        </div>
      ),
      width: 'w-48',
    },
    {
      key: 'status',
      label: 'Status',
      render: (internship: Internship) => (
        <div className="space-y-1">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${internship.isActive
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${internship.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            {internship.isActive ? 'Active' : 'Draft'}
          </span>
          {internship.isFeatured && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured
            </span>
          )}
        </div>
      ),
      width: 'w-32',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (internship: Internship) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push(`/admin/internships/${internship._id}/edit`)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(internship._id)}
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
  ], [selectedIds, internships, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-[#5693C1]/10 to-blue-400/10 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Internships</h1>
            <p className="mt-2 text-gray-600">
              Manage and monitor all internship listings
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/internships/add')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#5693C1] to-blue-500 text-white rounded-xl hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Internship
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search */}
          <div className="md:col-span-5">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search internships by title, company..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Draft</option>
              <option value="featured">Featured</option>
            </select>
          </div>

          {/* Sort */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
            >
              <option value="createdAt">Newest First</option>
              <option value="title">Title A-Z</option>
              <option value="company">Company A-Z</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="md:col-span-1">
            <button
              onClick={() => {
                setSearch('');
                setStatus('all');
                setSortBy('createdAt');
                setPage(1);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {selectedIds.length} selected
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
                  Set Draft
                </button>
                <button
                  onClick={() => handleBulkAction('feature')}
                  className="px-3 py-1.5 text-sm font-medium bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
                >
                  Feature
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
                <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-64 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : internships.length === 0 ? (
          // Empty State
          <div className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No internships found</h3>
            <p className="text-gray-500 mb-6">
              {search ? 'Try adjusting your search or filters' : 'Get started by creating your first internship'}
            </p>
            <button
              onClick={() => router.push('/admin/internships/add')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#5693C1] to-blue-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add First Internship
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
                  {internships.map((internship) => (
                    <tr key={internship._id} className="hover:bg-gray-50 transition-colors">
                      {columns.map((column) => (
                        <td key={column.key} className="px-4 py-3">
                          {column.render(internship)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
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
                  Page {page}
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


      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
        }}
        onConfirm={confirmDeleteInternship}
        title="Delete Internship"
        message="Are you sure you want to delete this internship? This action cannot be undone."
        confirmText="Delete Internship"
        cancelText="Cancel"
        type="danger"
        isLoading={isProcessing}
      />

      {/* Bulk Action Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBulkModal}
        onClose={() => {
          setShowBulkModal(false);
          setBulkAction(null);
        }}
        onConfirm={confirmBulkAction}
        title={`Confirm Bulk ${bulkAction?.charAt(0).toUpperCase()}${bulkAction?.slice(1)}`}
        message={`Are you sure you want to ${bulkAction} ${selectedIds.length} selected internship(s)?`}
        confirmText={`Yes, ${bulkAction}`}
        cancelText="Cancel"
        type={bulkAction === 'delete' ? 'danger' : 'warning'}
        isLoading={isProcessing}
      />
    </div >
  );
}