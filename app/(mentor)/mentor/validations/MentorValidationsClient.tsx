'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

import {
    CheckCircle,
    XCircle,
    BarChart3,
    Users as UsersIcon,
    ArrowUpRight,
    Search
} from 'lucide-react';

interface GroupedUser {
    userId: string;
    name: string;
    email: string;
    image?: string;
    targetRole: string;
    pendingCount: number;
    oldestPendingAt: string;
}

interface Stats {
    pending: number;
    validated: number;
    rejected: number;
    total: number;
    assignedStudents: number;
}

export default function MentorValidationsClient() {
    const [users, setUsers] = useState<GroupedUser[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchQueue = useCallback(async () => {
        try {
            setLoading(true);
            const [queueRes, statsRes] = await Promise.all([
                fetch('/api/mentor/validation-queue'),
                fetch('/api/mentor/validation-stats')
            ]);

            const queueData = await queueRes.json();
            const statsData = await statsRes.json();

            if (queueData.success) {
                setUsers(queueData.data.users);
            }
            if (statsData.success) {
                setStats(statsData.data);
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-8" />
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse border border-gray-100" />
                ))}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Stats Summary */}
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-[#5693C1]">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Overall</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                            <div className="text-sm text-gray-500 mt-1">Total Skills Processed</div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Success</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stats.validated}</div>
                            <div className="text-sm text-gray-500 mt-1">Successful Validations</div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-red-50 rounded-lg text-red-600">
                                    <XCircle className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rejected</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stats.rejected}</div>
                            <div className="text-sm text-gray-500 mt-1">Rejected Skills</div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <UsersIcon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reach</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stats.assignedStudents}</div>
                            <div className="text-sm text-gray-500 mt-1">Assigned Students</div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Validation Inbox</h1>
                        <p className="text-gray-500 mt-1">
                            Review and validate skills for your assigned learners.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#5693C1] rounded-lg font-medium">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5693C1]"></span>
                        </span>
                        {users.length} Learners Awaiting Review
                    </div>
                </div>

                {error ? (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center justify-between">
                        <span>{error}</span>
                        <button onClick={fetchQueue} className="underline font-medium">Retry</button>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Queue is empty</h3>
                        <p className="text-gray-500 mt-1">No learners currently awaiting validation.</p>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Target Role</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Oldest Request</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((user) => (
                                        <tr key={user.userId} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    {user.image ? (
                                                        <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-[#5693C1] flex items-center justify-center font-bold">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-semibold text-gray-900 group-hover:text-[#5693C1] transition-colors">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {user.targetRole}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 text-orange-600 font-bold border border-orange-100">
                                                    {user.pendingCount}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">
                                                    {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                                                        Math.ceil((new Date(user.oldestPendingAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                                                        'day'
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                                                    {new Intl.DateTimeFormat('en-IN').format(new Date(user.oldestPendingAt))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <Link
                                                    href={`/mentor/validations/${user.userId}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:border-[#5693C1] hover:text-[#5693C1] transition-all shadow-sm"
                                                >
                                                    Review
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
        </div>
    );
}
