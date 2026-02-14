'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MentorAssignmentDropdown from '@/components/admin/MentorAssignmentDropdown';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    mentorId?: string;
}

interface MentorWorkload {
    mentorId: string;
    mentorName: string;
    assignedUsersCount: number;
    pendingValidationsCount: number;
    isActive: boolean;
}

export default function MentorshipClient() {
    const router = useRouter();
    const [unassignedUsers, setUnassignedUsers] = useState<User[]>([]);
    const [mentors, setMentors] = useState<MentorWorkload[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch unassigned users
            const usersRes = await fetch('/api/admin/users?filter=unassigned&limit=50');
            const usersData = await usersRes.json();

            // Fetch mentor workloads
            const mentorsRes = await fetch('/api/admin/mentor-workload');
            const mentorsData = await mentorsRes.json();

            setUnassignedUsers(usersData.results || []);
            setMentors(mentorsData.mentors || []);
        } catch (error) {
            console.error('Error fetching mentorship data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssignmentComplete = () => {
        // Refresh data after assignment
        fetchData();
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-2xl p-6">
                <h1 className="text-2xl font-bold text-gray-900">Mentorship Management</h1>
                <p className="mt-2 text-gray-600">
                    Assign mentors to students and monitor mentor workload distribution.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Unassigned Students */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                Students Needing Mentors
                                <span className="bg-red-100 text-red-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    {unassignedUsers.length}
                                </span>
                            </h2>
                            <button
                                onClick={fetchData}
                                className="text-sm text-[#5693C1] hover:underline"
                            >
                                Refresh
                            </button>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : unassignedUsers.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p>🎉 All active students have mentors!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {unassignedUsers.map((user) => (
                                    <div key={user._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">{user.name}</h3>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="w-64">
                                            <MentorAssignmentDropdown
                                                userId={user._id}
                                                currentMentorId={null} // Always null since this is the unassigned list
                                                onAssign={handleAssignmentComplete}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Mentor Stats */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Mentor Workload</h2>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {mentors.map((mentor) => (
                                    <div key={mentor.mentorId} className="p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-gray-900">{mentor.mentorName}</span>
                                            {mentor.isActive ? (
                                                <span className="w-2 h-2 bg-green-500 rounded-full" title="Active"></span>
                                            ) : (
                                                <span className="w-2 h-2 bg-gray-400 rounded-full" title="Inactive"></span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-3">
                                            <div className="text-center p-2 bg-white rounded-lg border border-gray-100">
                                                <div className="text-lg font-bold text-[#5693C1]">
                                                    {mentor.assignedUsersCount}
                                                </div>
                                                <div className="text-xs text-gray-500">Students</div>
                                            </div>
                                            <div className="text-center p-2 bg-white rounded-lg border border-gray-100">
                                                <div className="text-lg font-bold text-orange-500">
                                                    {mentor.pendingValidationsCount}
                                                </div>
                                                <div className="text-xs text-gray-500">Pending</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {mentors.length === 0 && (
                                    <p className="text-center text-gray-500 py-4">No mentors found.</p>
                                )}

                                <div className="pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => router.push('/admin/users?filter=mentor')}
                                        className="w-full py-2 text-sm text-[#5693C1] hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        Manage Mentors
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
