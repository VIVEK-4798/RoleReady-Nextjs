/**
 * Admin Internships Client Component
 * 
 * Client-side table for managing internships with search, bulk actions, and CRUD operations.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDataTable } from '@/components/admin';

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

  const limit = 10;

  // Fetch internships
  const fetchInternships = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        status,
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
  }, [page, search, status]);

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) {
      alert('Please select internships first');
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} ${selectedIds.length} internship(s)?`;
    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch('/api/admin/internships/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: selectedIds }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedIds([]);
        fetchInternships();
        alert(data.message);
      } else {
        alert(data.error || 'Action failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this internship?')) return;

    try {
      const response = await fetch(`/api/admin/internships/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchInternships();
        alert(data.message);
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
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
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Table columns
  const columns = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.length === internships.length && internships.length > 0}
          onChange={toggleSelectAll}
          className="w-4 h-4 text-[#5693C1] rounded border-gray-300 focus:ring-[#5693C1]"
        />
      ),
      render: (internship: Internship) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(internship._id)}
          onChange={() => toggleSelect(internship._id)}
          className="w-4 h-4 text-[#5693C1] rounded border-gray-300 focus:ring-[#5693C1]"
        />
      ),
    },
    {
      key: 'company',
      label: 'Company',
      render: (internship: Internship) => (
        <span className="font-medium text-gray-900">{internship.company}</span>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (internship: Internship) => (
        <span className="text-gray-900">{internship.title}</span>
      ),
    },
    {
      key: 'city',
      label: 'City',
      render: (internship: Internship) => (
        <span className="text-gray-600">{internship.city}</span>
      ),
    },
    {
      key: 'stipend',
      label: 'Stipend',
      render: (internship: Internship) => (
        <span className="text-gray-900">{internship.stipend}</span>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (internship: Internship) => (
        <span className="text-gray-600">{internship.duration}</span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (internship: Internship) => (
        <span className="text-gray-600">{internship.type}</span>
      ),
    },
    {
      key: 'workDetail',
      label: 'Work Detail',
      render: (internship: Internship) => (
        <span className="text-gray-600 truncate max-w-37.5 block">
          {internship.workDetail}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (internship: Internship) => (
        <div className="flex flex-col gap-1">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              internship.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {internship.isActive ? 'Active' : 'Draft'}
          </span>
          {internship.isFeatured && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
              Featured
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (internship: Internship) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/admin/internships/${internship._id}/edit`)}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(internship._id)}
            className="text-red-600 hover:text-red-800 font-medium text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Internships</h1>
          <p className="mt-1 text-gray-600">
            Manage internship listings
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/internships/add')}
          className="px-4 py-2 bg-[#5693C1] text-white rounded-lg hover:bg-[#4a7fa8] transition-colors"
        >
          Add Internship
        </button>
      </div>

      {/* Filters & Bulk Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search internships..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1]"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Draft</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              {selectedIds.length} selected
            </span>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={() => handleBulkAction('deactivate')}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              Set Draft
            </button>
            <button
              onClick={() => handleBulkAction('feature')}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
            >
              Make Featured
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <AdminDataTable
        data={internships}
        columns={columns as any}
        isLoading={loading}
        emptyMessage="No internships found"
        title="Internships"
      />

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
            <span className="font-medium">{total}</span> results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * limit >= total}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
