/**
 * Skill Validation Queue Client Component
 * 
 * Table view for mentors to validate/reject user skills.
 * Migrated from old React project validation-queue component.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface SkillValidation {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  skillId: {
    _id: string;
    name: string;
    category: string;
  };
  level: string;
  source: string;
  validationStatus: string;
  requestedAt: string;
  targetRole?: {
    name: string;
  };
}

interface Stats {
  pending: number;
  validated: number;
  rejected: number;
}

export default function ValidationQueueClient() {
  const [queue, setQueue] = useState<SkillValidation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ pending: 0, validated: 0, rejected: 0 });
  const [processing, setProcessing] = useState<string | null>(null);
  
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
        setQueue(data.data.queue || []);
        setStats(prev => ({
          ...prev,
          pending: data.data.pendingCount || data.data.queue?.length || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch validation history for stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/mentor/validation-history?limit=100');
      const data = await response.json();

      if (data.success && data.data.history) {
        const validated = data.data.history.filter(
          (h: { action: string }) => h.action === 'approved'
        ).length;
        const rejected = data.data.history.filter(
          (h: { action: string }) => h.action === 'rejected'
        ).length;

        setStats(prev => ({
          ...prev,
          validated,
          rejected,
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

  // Handle approve
  const handleApprove = async (skill: SkillValidation) => {
    setProcessing(skill._id);
    try {
      const response = await fetch(`/api/mentor/skills/${skill._id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: null }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove from queue
        setQueue(prev => prev.filter(s => s._id !== skill._id));
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          validated: prev.validated + 1,
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
        // Remove from queue
        setQueue(prev => prev.filter(s => s._id !== rejectModal.skill?._id));
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          rejected: prev.rejected + 1,
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
      validated: { bg: 'bg-green-100', text: 'text-green-800', label: 'Validated' },
    };
    const style = styles[source] || styles.self;
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  // Get level badge color
  const getLevelBadge = (level: string) => {
    const styles: Record<string, string> = {
      beginner: 'bg-gray-100 text-gray-800',
      intermediate: 'bg-blue-100 text-blue-800',
      advanced: 'bg-purple-100 text-purple-800',
      expert: 'bg-green-100 text-green-800',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${styles[level] || styles.beginner}`}>
        {level}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🎓 Skill Validation Queue</h1>
        <p className="mt-1 text-gray-600">
          Review and validate user skills. Your validation adds credibility to their profile.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-700">{stats.validated}</div>
          <div className="text-sm text-green-600">Validated</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
          <div className="text-sm text-red-600">Rejected</div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600">
            Loading validation queue...
          </div>
        ) : queue.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-2">✨</div>
            <p className="text-gray-600">No skills pending validation!</p>
            <p className="text-sm text-gray-500 mt-1">
              Check back later for new skills to review.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skill
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {queue.map((skill, idx) => (
                  <tr key={skill._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {skill.userId?.name || 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {skill.userId?.email || ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">
                        {skill.skillId?.name || 'Unknown Skill'}
                      </div>
                      {skill.skillId?.category && (
                        <div className="text-xs text-gray-500">
                          {skill.skillId.category}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {getLevelBadge(skill.level)}
                    </td>
                    <td className="px-4 py-4">
                      {getSourceBadge(skill.source)}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {skill.targetRole?.name || '—'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(skill)}
                          disabled={processing === skill._id}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(skill)}
                          disabled={processing === skill._id}
                          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          ✗ Reject
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

      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reject Skill Validation
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Rejecting: <strong>{rejectModal.skill?.skillId?.name}</strong> from{' '}
              <strong>{rejectModal.skill?.userId?.name}</strong>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Rejection *
              </label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1]"
                placeholder="Please provide a clear reason (min 10 characters)..."
              />
              {rejectError && (
                <p className="mt-1 text-sm text-red-600">{rejectError}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={processing !== null}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? 'Rejecting...' : 'Confirm Reject'}
              </button>
              <button
                onClick={closeRejectModal}
                disabled={processing !== null}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
