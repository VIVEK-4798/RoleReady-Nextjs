/**
 * Mentor Internships Client Component
 * 
 * Table view for managing internships with advanced features.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  category?: {
    _id: string;
    name: string;
    colorClass: string;
  };
  applications?: number;
  createdAt: string;
}

interface Stats {
  total: number;
  active: number;
  featured: number;
  applications: number;
}

export default function MentorInternshipsClient() {
  const router = useRouter();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    featured: 0,
    applications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const limit = 10;


  // Fetch internships
  const fetchInternships = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: searchTerm,
        status: statusFilter,
      });

      const response = await fetch(`/api/mentor/internships?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setInternships(result.data.internships);
        setStats(result.data.stats);
        setTotalPages(result.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching internships:', error);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter]);

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  // Handle delete
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteInternship = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/mentor/internships/${deleteId}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (result.success) {
        fetchInternships(); // Refresh list and stats
        toast.success('Internship deleted successfully!');
        setShowDeleteModal(false);
        setDeleteId(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting internship:', error);
      toast.error('Failed to delete internship. Please try again.');
    }
  };

  // Toggle active status
  const toggleStatus = async (internship: Internship) => {
    try {
      const response = await fetch(`/api/mentor/internships/${internship._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !internship.isActive })
      });
      const result = await response.json();

      if (result.success) {
        fetchInternships();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status. Please try again.');
    }
  };

  // Toggle featured status
  const toggleFeatured = async (internship: Internship) => {
    try {
      const response = await fetch(`/api/mentor/internships/${internship._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !internship.isFeatured })
      });
      const result = await response.json();

      if (result.success) {
        fetchInternships();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Failed to update featured status. Please try again.');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    if (!isActive) {
      return {
        text: 'Inactive',
        className: 'bg-gray-100 text-gray-800 border border-gray-200',
      };
    }

    return {
      text: 'Active',
      className: 'bg-green-100 text-green-800 border border-green-200',
    };
  };

  // Get type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'full-time':
        return {
          text: 'Full Time',
          className: 'bg-blue-100 text-blue-800 border border-blue-200',
        };
      case 'part-time':
        return {
          text: 'Part Time',
          className: 'bg-purple-100 text-purple-800 border border-purple-200',
        };
      case 'remote':
        return {
          text: 'Remote',
          className: 'bg-teal-100 text-teal-800 border border-teal-200',
        };
      default:
        return {
          text: type,
          className: 'bg-gray-100 text-gray-800 border border-gray-200',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">💼 Internships</h1>
          <p className="mt-2 text-gray-600">
            Manage your internship listings and track applications
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/mentor/internships/add"
            className="px-4 py-2.5 bg-gradient-to-r from-[#5693C1] to-[#4a80b0] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Internship
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Internships</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            All internship listings
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Internships</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 01118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Currently accepting applications
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Featured</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.featured}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Highlighted listings
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.applications}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-6.197a6 6 0 00-9 5.197" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Applications received
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search internships by title, company, location, or skills..."
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                style={{ color: '#000000' }}
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="remote">Remote</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Showing {internships.length} of {stats.total} internships
          </span>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
        </div>
      </div>

      {/* Internships Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#5693C1]/10 mb-4">
              <svg className="w-6 h-6 text-[#5693C1] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-gray-600">Loading internships...</p>
          </div>
        ) : internships.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No internships found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No internships match your search criteria. Try adjusting your filters.'
                : 'You haven\'t posted any internships yet. Create your first internship to get started.'}
            </p>
            <Link
              href="/mentor/internships/add"
              className="px-6 py-3 bg-gradient-to-r from-[#5693C1] to-[#4a80b0] text-white rounded-lg font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create First Internship
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Internship Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Location & Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status & Applications
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {internships.map((internship) => {
                  const statusBadge = getStatusBadge(internship.isActive);
                  const typeBadge = getTypeBadge(internship.type);

                  return (
                    <tr key={internship._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-start gap-3 mb-2">
                            {internship.isFeatured && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Featured
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge.className}`}>
                              {statusBadge.text}
                            </span>
                          </div>

                          <h4 className="font-semibold text-gray-900 text-sm mb-1">{internship.title}</h4>
                          <p className="text-gray-600 text-sm mb-2">{internship.company}</p>

                          {internship.category && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              <span className={`px-2 py-0.5 ${internship.category.colorClass || 'bg-gray-100 text-gray-700'} text-xs rounded`}>
                                {internship.category.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {internship.city}
                          </div>

                          <div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${typeBadge.className}`}>
                              {typeBadge.text}
                            </span>
                          </div>

                          <div className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900">{internship.stipend}</span> • {internship.duration}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-600">Applications:</span>
                              <span className="font-medium text-gray-900">{internship.applications || 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-[#5693C1] h-1.5 rounded-full"
                                style={{ width: `${Math.min((internship.applications || 0) * 2, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/mentor/internships/edit/${internship._id}`}
                            className="px-3 py-1.5 text-xs border border-[#5693C1] text-[#5693C1] hover:bg-[#5693C1] hover:text-white rounded-lg font-medium transition-colors text-center"
                          >
                            Edit
                          </Link>

                          <button
                            onClick={() => toggleStatus(internship)}
                            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${internship.isActive
                              ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                              : 'border border-green-300 text-green-700 hover:bg-green-50'
                              }`}
                          >
                            {internship.isActive ? 'Deactivate' : 'Activate'}
                          </button>

                          <button
                            onClick={() => toggleFeatured(internship)}
                            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${internship.isFeatured
                              ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                              : 'border border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                              }`}
                          >
                            {internship.isFeatured ? 'Remove Feature' : 'Feature'}
                          </button>

                          <button
                            onClick={() => handleDelete(internship._id)}
                            className="px-3 py-1.5 text-xs border border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-6 py-4">
          <div className="text-sm text-gray-500">
            Showing page {page} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium ${page === pageNum
                    ? 'bg-[#5693C1] text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-[#5693C1]/5 to-[#4a80b0]/5 border border-[#5693C1]/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#5693C1] flex items-center justify-center text-white flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Internship Management Tips</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <span className="font-medium">Featured internships</span> get 3x more applications</li>
              <li>• Keep internship descriptions detailed and clear</li>
              <li>• Set realistic application deadlines</li>
              <li>• Review applications regularly and respond promptly</li>
              <li>• Use relevant skills tags to attract the right candidates</li>
            </ul>
          </div>
        </div>
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
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div >
  );
}