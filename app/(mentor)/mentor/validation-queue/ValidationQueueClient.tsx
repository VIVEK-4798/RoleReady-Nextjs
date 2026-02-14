'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

interface GroupedUser {
  userId: string;
  name: string;
  email: string;
  image?: string;
  targetRole: string;
  pendingCount: number;
  oldestPendingAt: string;
}

export default function ValidationQueueClient() {
  const { success, error: toastError } = useToast();
  const [users, setUsers] = useState<GroupedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/mentor/validation-queue');
      const data = await res.json();

      if (data.success) {
        // The new API returns data.users
        setUsers(data.data.users || []);
      } else {
        setError(data.error || 'Failed to fetch queue');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  if (loading) {
    return (
      <div className="space-y-4 p-8">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-8" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-24 bg-gray-100/50 rounded-2xl animate-pulse border border-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            📥 Validation Inbox
          </h1>
          <p className="text-gray-500 mt-1">
            Review skill submissions grouped by learner for better context.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-blue-50 text-[#5693C1] rounded-xl font-bold border border-blue-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5693C1] animate-pulse" />
            {users.length} Learners Waiting
          </div>
        </div>
      </div>

      {error ? (
        <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
          <button onClick={fetchQueue} className="px-4 py-2 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
            Retry
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 text-center">
          <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 ring-4 ring-gray-50">
            <svg className="w-10 h-10 text-[#5693C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">All caught up!</h3>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto">
            No skills pending validation. You've cleared your queue.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">Learner</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">Goal / Target Role</th>
                  <th className="px-6 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">Pending Skills</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">Oldest Request</th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.userId} className="hover:bg-blue-50/20 transition-all group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        {user.image ? (
                          <img src={user.image} alt={user.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#5693C1]/20 transition-all" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#5693C1] flex items-center justify-center font-bold text-lg">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-[#5693C1] transition-colors">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold ${user.targetRole !== 'Not Set'
                          ? 'bg-blue-50 text-[#5693C1] border border-blue-100'
                          : 'bg-gray-100 text-gray-500'
                        }`}>
                        {user.targetRole}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-lg bg-orange-100 text-orange-700 font-black text-sm border border-orange-200">
                        {user.pendingCount}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-700">
                        {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                          Math.ceil((new Date(user.oldestPendingAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                          'day'
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        {new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(user.oldestPendingAt))}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link
                        href={`/mentor/validations/${user.userId}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-[#5693C1] hover:text-[#5693C1] transition-all shadow-sm hover:shadow-md"
                      >
                        Open Queue
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}