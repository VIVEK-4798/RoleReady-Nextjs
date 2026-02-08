'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Category {
  _id: string;
  name: string;
  colorClass?: string;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  city: string;
  salary: string;
  experience: string;
  type: string;
  workDetail?: string;
  isActive: boolean;
  isFeatured: boolean;
  category?: Category;
  createdAt: string;
  createdBy?: string;
}

interface PaginationData {
  total: number;
  pages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiResponse {
  success: boolean;
  data: Job[];
  pagination?: PaginationData;
}

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_DELAY = 300;

export default function MentorJobsClient() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/mentor/jobs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setJobs(data.data);
        
        if (data.pagination) {
          setTotalItems(data.pagination.total || 0);
          setTotalPages(data.pagination.pages || 0);
        }
      } else {
        console.warn('Invalid data format received:', data);
        setJobs([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs();
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [fetchJobs]);

  const handleToggleStatus = async (job: Job) => {
    try {
      const response = await fetch(`/api/mentor/jobs/${job._id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ isActive: !job.isActive }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchJobs();
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update job status. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!jobToDelete) return;

    try {
      const response = await fetch(`/api/mentor/jobs/${jobToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setDeleteModalOpen(false);
      setJobToDelete(null);
      await fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job. Please try again.');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'all' | 'active' | 'inactive';
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const paginationButtons = useMemo(() => {
    const buttons: number[] = [];
    const maxVisibleButtons = 5;
    
    if (totalPages <= maxVisibleButtons) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      buttons.push(1);
      
      if (start > 2) {
        buttons.push(-1); // Ellipsis marker
      }
      
      for (let i = start; i <= end; i++) {
        buttons.push(i);
      }
      
      if (end < totalPages - 1) {
        buttons.push(-2); // Ellipsis marker
      }
      
      if (totalPages > 1) {
        buttons.push(totalPages);
      }
    }
    
    return buttons;
  }, [currentPage, totalPages]);

  const renderJobRow = (job: Job) => (
    <tr 
      key={job._id} 
      className="hover:bg-gray-50 transition-colors duration-150"
    >
      <td className="px-4 py-4 md:px-6">
        <div className="flex flex-col">
          <div className="font-medium text-gray-900">{job.company}</div>
          {job.category && (
            <div className="text-xs text-gray-500 truncate max-w-[150px] md:max-w-none">
              {job.category.name}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-4 md:px-6">
        <div className="flex flex-col">
          <div className="text-gray-900 truncate max-w-[120px] md:max-w-none">
            {job.title}
          </div>
          <div className="text-xs text-gray-500">{job.type}</div>
        </div>
      </td>
      <td className="px-4 py-4 md:px-6 whitespace-nowrap text-gray-600">
        {job.city}
      </td>
      <td className="px-4 py-4 md:px-6 whitespace-nowrap text-gray-600">
        {job.salary}
      </td>
      <td className="px-4 py-4 md:px-6 whitespace-nowrap text-gray-600">
        {job.experience}
      </td>
      <td className="px-4 py-4 md:px-6 whitespace-nowrap">
        <span
          className={`inline-flex px-2 py-1 text-xs rounded-full ${
            job.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {job.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-4 md:px-6 whitespace-nowrap">
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => handleToggleStatus(job)}
            className="p-1 md:p-2 text-gray-500 hover:text-[#5693C1] hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title={job.isActive ? 'Deactivate' : 'Activate'}
            aria-label={job.isActive ? 'Deactivate job' : 'Activate job'}
          >
            {job.isActive ? (
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            ) : (
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <button
            onClick={() => router.push(`/mentor/jobs/${job._id}/edit`)}
            className="p-1 md:p-2 text-gray-500 hover:text-[#5693C1] hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="Edit"
            aria-label="Edit job"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => {
              setJobToDelete(job);
              setDeleteModalOpen(true);
            }}
            className="p-1 md:p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete"
            aria-label="Delete job"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-white p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600 text-sm md:text-base">Manage job listings</p>
        </div>
        <Link
          href="/mentor/jobs/add"
          className="inline-flex items-center justify-center px-4 py-2 md:px-5 md:py-2.5 bg-[#5693C1] text-white text-sm md:text-base font-medium rounded-lg hover:bg-[#4682b4] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:ring-offset-2"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Job
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search jobs by title, company, or city..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-gray-900 placeholder-gray-500 text-sm md:text-base transition-all duration-200"
              style={{ color: '#000' }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-gray-900 bg-white text-sm md:text-base transition-all duration-200"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 md:p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-b-2 border-[#5693C1] mx-auto"></div>
            <p className="mt-3 md:mt-4 text-gray-500 text-sm md:text-base">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-sm md:text-base mb-2">No jobs found</p>
            <p className="text-gray-400 text-xs md:text-sm mb-4">
              {searchQuery || statusFilter !== 'all' ? 'Try changing your search or filters' : 'Get started by adding your first job'}
            </p>
            <Link
              href="/mentor/jobs/add"
              className="inline-flex items-center text-[#5693C1] hover:text-[#4682b4] font-medium text-sm md:text-base transition-colors"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add your first job
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobs.map(renderJobRow)}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-4 md:px-6 md:py-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs md:text-sm text-gray-500">
                  Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> of{' '}
                  <span className="font-medium">{totalItems}</span> jobs
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    aria-label="Previous page"
                  >
                    Previous
                  </button>
                  
                  {paginationButtons.map((pageNum, index) => (
                    <span key={`page-${pageNum}-${index}`}>
                      {pageNum < 0 ? (
                        <span className="px-2 md:px-3 text-gray-400">...</span>
                      ) : (
                        <button
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent ${
                            currentPage === pageNum
                              ? 'bg-[#5693C1] text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                          aria-label={`Page ${pageNum}`}
                          aria-current={currentPage === pageNum ? 'page' : undefined}
                        >
                          {pageNum}
                        </button>
                      )}
                    </span>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && jobToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setDeleteModalOpen(false)}
            aria-hidden="true"
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-auto animate-in fade-in duration-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Job
            </h3>
            <p className="text-gray-600 mb-6 text-sm md:text-base">
              Are you sure you want to delete <span className="font-medium">&quot;{jobToDelete.title}&quot;</span> at{' '}
              <span className="font-medium">{jobToDelete.company}</span>? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                Delete Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}