'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface MentorRequest {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        image?: string;
        profile?: any;
    };
    status: string;
    requestedAt: string;
    snapshotOfUserData?: any;
}

export default function MentorRequestsPage() {
    const [requests, setRequests] = useState<MentorRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [rejectionId, setRejectionId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/admin/mentor-role-requests');
            const data = await res.json();
            if (data.success) {
                setRequests(data.data);
            }
        } catch (error) {
            toast.error('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId: string) => {
        setActionLoading(requestId);
        try {
            const res = await fetch(`/api/admin/mentor-role-requests/${requestId}/approve`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Request approved');
                setRequests(requests.filter(r => r._id !== requestId));
            } else {
                toast.error(data.message || 'Approval failed');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectionId || !rejectionReason.trim()) return;

        setActionLoading(rejectionId);
        try {
            const res = await fetch(`/api/admin/mentor-role-requests/${rejectionId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectionReason })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Request rejected');
                setRequests(requests.filter(r => r._id !== rejectionId));
                setRejectionId(null);
                setRejectionReason('');
            } else {
                toast.error(data.message || 'Rejection failed');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5693C1]"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mentor Role Requests</h1>
                    <p className="text-gray-500 mt-1">Review and approve candidates to become mentors on the platform.</p>
                </div>
                <div className="bg-[#5693C1]/10 px-4 py-2 rounded-lg">
                    <span className="text-[#5693C1] font-semibold">{requests.length} Pending</span>
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                    <p className="text-gray-500">There are no pending mentor requests to review.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {requests.map((request) => (
                        <div key={request._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                            <div className="p-6 flex-1">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-[#5693C1] font-bold text-lg overflow-hidden shrink-0">
                                        {request.userId?.image ? (
                                            <img src={request.userId.image} alt={request.userId.name} className="w-full h-full object-cover" />
                                        ) : (
                                            request.userId?.name.charAt(0) || 'U'
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-gray-900 truncate">{request.userId?.name}</h3>
                                            <span className="text-xs text-gray-400 hidden sm:block">•</span>
                                            <p className="text-sm text-gray-500 truncate">{request.userId?.email}</p>
                                        </div>
                                        <p className="text-xs text-[#5693C1] font-medium uppercase tracking-wider mb-4">
                                            Requested {format(new Date(request.requestedAt), 'MMM d, yyyy')}
                                        </p>

                                        {/* Profile Snapshot Info */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Headline</p>
                                                <p className="text-sm text-gray-700 truncate">{request.userId?.profile?.headline || 'Not set'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Experience</p>
                                                <p className="text-sm text-gray-700">{request.userId?.profile?.experience?.length || 0} entries</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Education</p>
                                                <p className="text-sm text-gray-700">{request.userId?.profile?.education?.length || 0} entries</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100 p-6 flex flex-row md:flex-col justify-center gap-3 w-full md:w-48 shrink-0">
                                <button
                                    onClick={() => handleApprove(request._id)}
                                    disabled={actionLoading === request._id}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => setRejectionId(request._id)}
                                    disabled={actionLoading === request._id}
                                    className="flex-1 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Rejection Modal (Simplified) */}
            {rejectionId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Application</h3>
                        <p className="text-sm text-gray-500 mb-4">Please provide a reason for the rejection. This will be shared with the applicant.</p>
                        <textarea
                            className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5693C1]"
                            placeholder="e.g. Insufficient industry experience, please complete more benchmarks first..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => { setRejectionId(null); setRejectionReason(''); }}
                                className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectionReason.trim() || actionLoading === rejectionId}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                Send Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
