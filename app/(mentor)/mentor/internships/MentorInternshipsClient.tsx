/**
 * Mentor Internships Client Component
 * 
 * Table view for managing internships.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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
    name: string;
    colorClass: string;
  };
  createdAt: string;
}

export default function MentorInternshipsClient() {
  const router = useRouter();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

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

      const response = await fetch(`/api/mentor/internships?${params}`);
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

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this internship?')) return;

    try {
      const response = await fetch(`/api/mentor/internships/${id}`, {
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

  // Toggle status
  const toggleStatus = async (internship: Internship) => {
    try {
      const response = await fetch(`/api/mentor/internships/${internship._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !internship.isActive }),
      });

      const data = await response.json();

      if (data.success) {
        fetchInternships();
      } else {
        alert(data.error || 'Update failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Internships</h1>
          <p className="mt-1 text-gray-600">
            Manage your internship listings
          </p>
        </div>
        <button
          onClick={() => router.push('/mentor/internships/add')}
          className="px-4 py-2 bg-[#5693C1] text-white rounded-lg hover:bg-[#4a7fa8] transition-colors"
        >
          Add Internship
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600">
            Loading internships...
          </div>
        ) : internships.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-2">💼</div>
            <p className="text-gray-600">No internships found</p>
            <button
              onClick={() => router.push('/mentor/internships/add')}
              className="mt-4 px-4 py-2 bg-[#5693C1] text-white rounded-lg hover:bg-[#4a7fa8] transition-colors"
            >
              Add Your First Internship
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stipend
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {internships.map((internship, idx) => (
                  <tr key={internship._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {internship.company}
                    </td>
                    <td className="px-4 py-4 text-gray-900">
                      {internship.title}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {internship.city}
                    </td>
                    <td className="px-4 py-4 text-gray-900">
                      {internship.stipend}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {internship.duration}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleStatus(internship)}
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          internship.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {internship.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/mentor/internships/${internship._id}/edit`)}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
