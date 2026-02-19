'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface PendingSkill {
    _id: string;
    skillName: string;
    skillDomain: string;
    level: string;
    source: string;
    requestedAt: string;
}

interface UserDetails {
    userId: string;
    name: string;
    email: string;
    image?: string;
    targetRole?: string;
}

export default function UserValidationDetailsClient({ userId }: { userId: string }) {
    const router = useRouter();
    const [skills, setSkills] = useState<PendingSkill[]>([]);
    const [user, setUser] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchUserDetails = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/mentor/validation-queue/${userId}`);
            const data = await res.json();

            if (data.success) {
                setSkills(data.data.skills);
                if (data.data.user) {
                    setUser({
                        userId: data.data.user.id,
                        name: data.data.user.name,
                        email: data.data.user.email,
                        image: data.data.user.image,
                        targetRole: data.data.user.targetRole
                    });
                }
            }
        } catch (err) {
            console.error('Error:', err);
            toast.error('Failed to load user details');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUserDetails();
    }, [fetchUserDetails]);

    const handleAction = async (skillId: string, action: 'approve' | 'reject') => {
        try {
            setProcessingId(skillId);
            const res = await fetch(`/api/mentor/skills/${skillId}/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note: `Result: ${action === 'approve' ? 'Satisfactory' : 'Needs improvement'}` })
            });

            const data = await res.json();

            if (data.success) {
                toast.success(`Skill ${action}d successfully`);
                // Remove from local state
                setSkills(prev => prev.filter(s => s._id !== skillId));

                // If no skills left, go back to inbox after a delay
                if (skills.length <= 1) {
                    setTimeout(() => {
                        router.push('/mentor/validations');
                    }, 1500);
                }
            } else {
                toast.error(data.error || `Failed to ${action} skill`);
            }
        } catch (err) {
            console.error('Action error:', err);
            toast.error('Connection error');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <div className="p-8 animate-pulse space-y-4">
            <div className="h-20 bg-gray-100 rounded-2xl" />
            <div className="h-64 bg-gray-50 rounded-2xl" />
        </div>;
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/mentor/validations')}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-[#5693C1] flex items-center justify-center font-bold text-xl ring-2 ring-white">
                                {user?.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Pending Skills</div>
                            <div className="text-lg font-bold text-orange-600">{skills.length} Items</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                {skills.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <span className="text-2xl text-green-500 font-bold">✓</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">All Done!</h3>
                        <p className="text-gray-500 mt-1">You have reviewed all pending skills for this student.</p>
                        <button
                            onClick={() => router.push('/mentor/validations')}
                            className="mt-6 text-[#5693C1] font-semibold hover:underline"
                        >
                            Back to Inbox
                        </button>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Skill</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium">
                                {skills.map((skill) => (
                                    <tr key={skill._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-semibold text-gray-900">{skill.skillName}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 capitalize">{skill.skillDomain}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-black font-bold">
                                            {skill.level}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${skill.source === 'resume' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                                }`}>
                                                {skill.source}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-normal">
                                            {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(skill.requestedAt))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleAction(skill._id, 'reject')}
                                                    disabled={!!processingId}
                                                    className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleAction(skill._id, 'approve')}
                                                    disabled={!!processingId}
                                                    className="px-4 py-1.5 text-xs font-bold bg-[#5693C1] text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50"
                                                >
                                                    Approve
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
        </div>
    );
}
