/**
 * Skill Validation Queue Client Component
 * 
 * Table view for mentors to validate/reject user skills.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface SkillValidation {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  skillId: {
    _id: string;
    name: string;
    domain: string;
    description?: string;
  };
  level: string;
  source: string;
  validationStatus: string;
  createdAt: string;
  targetRole?: {
    name: string;
  };
  evidence?: string;
}

interface Stats {
  pending: number;
  validated: number;
  rejected: number;
  total: number;
}

interface FilterOptions {
  domain: string;
  level: string;
  source: string;
  dateRange: string;
}

export default function ValidationQueueClient() {
  const [queue, setQueue] = useState<SkillValidation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ pending: 0, validated: 0, rejected: 0, total: 0 });
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillValidation | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    domain: 'all',
    level: 'all',
    source: 'all',
    dateRange: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Detail modal state
  const [detailModal, setDetailModal] = useState<{ show: boolean; skill: SkillValidation | null }>({
    show: false,
    skill: null,
  });

  // Reject modal state
  const [rejectModal, setRejectModal] = useState<{ show: boolean; skill: SkillValidation | null }>({
    show: false,
    skill: null,
  });
  const [rejectNote, setRejectNote] = useState('');
  const [rejectError, setRejectError] = useState('');

  // Fetch validation queue
  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mentor/validation-queue?status=pending');
      const data = await response.json();

      if (data.success) {
        setQueue(data.data.ungrouped || []);
        setStats(prev => ({
          ...prev,
          pending: data.data.totalCount || 0,
          total: (data.data.ungrouped || []).length,
        }));
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch validation stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/mentor/validation-stats');
      const data = await response.json();

      if (data.success) {
        setStats(prev => ({
          ...prev,
          validated: data.data.validated || 0,
          rejected: data.data.rejected || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    fetchStats();
  }, [fetchQueue, fetchStats]);

  // Filter skills based on search and filters
  const filteredQueue = queue.filter((skill) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        skill.userId?.name?.toLowerCase().includes(searchLower) ||
        skill.skillId?.name?.toLowerCase().includes(searchLower) ||
        skill.userId?.email?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    if (filters.domain !== 'all' && skill.skillId?.domain !== filters.domain) {
      return false;
    }

    if (filters.level !== 'all' && skill.level !== filters.level) {
      return false;
    }

    if (filters.source !== 'all' && skill.source !== filters.source) {
      return false;
    }

    return true;
  });

  // Handle approve
  const handleApprove = async (skill: SkillValidation) => {
    setProcessing(skill._id);
    try {
      const response = await fetch(`/api/mentor/skills/${skill._id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: 'Skill validated successfully' }),
      });

      const data = await response.json();

      if (data.success) {
        setQueue(prev => prev.filter(s => s._id !== skill._id));
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          validated: prev.validated + 1,
          total: prev.total - 1,
        }));
      } else {
        alert(data.error || 'Failed to approve skill');
      }
    } catch (error) {
      console.error('Error approving:', error);
      alert('An error occurred');
    } finally {
      setProcessing(null);
    }
  };

  // Open detail modal
  const openDetailModal = (skill: SkillValidation) => {
    setDetailModal({ show: true, skill });
  };

  // Open reject modal
  const openRejectModal = (skill: SkillValidation) => {
    setRejectModal({ show: true, skill });
    setRejectNote('');
    setRejectError('');
  };

  // Close reject modal
  const closeRejectModal = () => {
    setRejectModal({ show: false, skill: null });
    setRejectNote('');
    setRejectError('');
  };

  // Handle reject
  const handleReject = async () => {
    if (!rejectModal.skill) return;

    if (rejectNote.trim().length < 10) {
      setRejectError('Please provide a reason (at least 10 characters)');
      return;
    }

    setProcessing(rejectModal.skill._id);
    try {
      const response = await fetch(`/api/mentor/skills/${rejectModal.skill._id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: rejectNote }),
      });

      const data = await response.json();

      if (data.success) {
        setQueue(prev => prev.filter(s => s._id !== rejectModal.skill?._id));
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          rejected: prev.rejected + 1,
          total: prev.total - 1,
        }));
        closeRejectModal();
      } else {
        setRejectError(data.error || 'Failed to reject skill');
      }
    } catch (error) {
      console.error('Error rejecting:', error);
      setRejectError('An error occurred');
    } finally {
      setProcessing(null);
    }
  };

  // Get source badge
  const getSourceBadge = (source: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      self: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Self' },
      resume: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Resume' },
      course: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Course' },
      project: { bg: 'bg-green-100', text: 'text-green-800', label: 'Project' },
    };
    const style = styles[source] || styles.self;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  // Get level badge
  const getLevelBadge = (level: string) => {
    const styles: Record<string, string> = {
      beginner: 'bg-gray-100 text-gray-800 border border-gray-200',
      intermediate: 'bg-blue-50 text-blue-700 border border-blue-200',
      advanced: 'bg-purple-50 text-purple-700 border border-purple-200',
      expert: 'bg-green-50 text-green-700 border border-green-200',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[level] || styles.beginner}`}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">🎓 Skill Validation Queue</h1>
          <p className="mt-2 text-gray-600">
            Review and validate student skills. Your validation helps build credible profiles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchQueue()}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Validation</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Skills waiting for review
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Validated</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.validated}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 01118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Approved skills this month
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.rejected}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Rejected skills this month
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total in Queue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Skills in current queue
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name, skill, or email..."
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                style={{ color: '#000000' }}
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
            <span className="text-sm text-gray-500">
              Showing {filteredQueue.length} of {queue.length} skills
            </span>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                <select
                  value={filters.domain}
                  onChange={(e) => setFilters({...filters, domain: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1]"
                >
                  <option value="all">All Domains</option>
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="fullstack">Full Stack</option>
                  <option value="mobile">Mobile</option>
                  <option value="devops">DevOps</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                <select
                  value={filters.level}
                  onChange={(e) => setFilters({...filters, level: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1]"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <select
                  value={filters.source}
                  onChange={(e) => setFilters({...filters, source: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1]"
                >
                  <option value="all">All Sources</option>
                  <option value="self">Self Assessment</option>
                  <option value="resume">Resume</option>
                  <option value="course">Course Certificate</option>
                  <option value="project">Project Work</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Skills Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#5693C1]/10 mb-4">
              <svg className="w-6 h-6 text-[#5693C1] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-gray-600">Loading validation queue...</p>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No skills found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {queue.length === 0 
                ? 'No skills pending validation. Check back later!'
                : 'No skills match your search criteria. Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Skill Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Level & Source
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQueue.map((skill) => (
                  <tr key={skill._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#5693C1] to-[#4a80b0] flex items-center justify-center text-white font-bold">
                          {skill.userId?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{skill.userId?.name || 'Unknown User'}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[150px]">
                            {skill.userId?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{skill.skillId?.name || 'Unknown Skill'}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-gray-100 rounded">{skill.skillId?.domain || 'General'}</span>
                          {skill.targetRole?.name && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">For: {skill.targetRole.name}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div>{getLevelBadge(skill.level)}</div>
                        <div>{getSourceBadge(skill.source)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{formatDate(skill.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDetailModal(skill)}
                          className="px-3 py-1.5 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleApprove(skill)}
                          disabled={processing === skill._id}
                          className="px-4 py-1.5 text-xs bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-1"
                        >
                          {processing === skill._id ? (
                            <>
                              <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Processing
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openRejectModal(skill)}
                          disabled={processing === skill._id}
                          className="px-3 py-1.5 text-xs border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                        >
                          Reject
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
      {filteredQueue.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredQueue.length}</span> of{' '}
            <span className="font-medium">{filteredQueue.length}</span> results
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button className="px-3 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg">
              1
            </button>
            <button className="px-3 py-2 text-sm border border-[#5693C1] bg-[#5693C1] text-white rounded-lg">
              2
            </button>
            <button className="px-3 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Reject Skill Validation</h3>
                <button onClick={closeRejectModal} className="text-gray-400 hover:text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <div className="p-4 bg-gray-50 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-2">Rejecting skill for:</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#5693C1] flex items-center justify-center text-white text-xs">
                      {rejectModal.skill?.userId?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{rejectModal.skill?.userId?.name}</p>
                      <p className="text-xs text-gray-500">{rejectModal.skill?.skillId?.name}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent resize-none"
                    placeholder="Please provide detailed feedback to help the student improve..."
                    style={{ color: '#000000' }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 10 characters required</p>
                  {rejectError && (
                    <p className="text-sm text-red-600 mt-2">{rejectError}</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={closeRejectModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing !== null}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}