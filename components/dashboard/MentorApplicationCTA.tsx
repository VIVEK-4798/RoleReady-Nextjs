'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function MentorApplicationCTA() {
    const { data: session, update } = useSession();
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const userRole = (session?.user as any)?.role;

    useEffect(() => {
        if (userRole === 'user') {
            fetchRequestStatus();
        }
    }, [userRole]);

    const fetchRequestStatus = async () => {
        try {
            const res = await fetch('/api/mentor-application/me', { cache: 'no-store' });
            const data = await res.json();
            if (data.success) {
                setRequest(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch request status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (!confirm('Are you sure you want to withdraw your application? This action cannot be undone.')) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/mentor-application/withdraw', {
                method: 'POST',
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Application withdrawn successfully');
                setRequest(null); // Reset local state
            } else {
                toast.error(data.message || 'Failed to withdraw application');
            }
        } catch (error) {
            toast.error('Connection error');
        } finally {
            setSubmitting(false);
        }
    };

    if (userRole !== 'user') return null;
    if (loading) return null;

    const status = request?.status;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                        Become a Mentor
                        {status === 'draft' && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase">
                                Application Draft
                            </span>
                        )}
                        {status === 'submitted' && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full uppercase">
                                Pending Review
                            </span>
                        )}
                        {status === 'approved' && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full uppercase">
                                Approved
                            </span>
                        )}
                        {status === 'rejected' && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full uppercase">
                                Application Rejected
                            </span>
                        )}
                    </h3>

                    {!request && (
                        <p className="text-gray-600 text-sm">
                            Share your expertise and help others grow. Apply today to start validating skills and mentoring candidates.
                        </p>
                    )}

                    {status === 'draft' && (
                        <p className="text-gray-600 text-sm">
                            You have an unfinished application. Continue where you left off.
                        </p>
                    )}

                    {status === 'submitted' && (
                        <p className="text-gray-600 text-sm">
                            Your application is currently under review by our administration team. We'll notify you once a decision is made.
                        </p>
                    )}

                    {status === 'approved' && (
                        <div className="space-y-3">
                            <p className="text-green-700 text-sm font-medium">
                                Your application has been approved! You are now a mentor.
                            </p>
                            <button
                                onClick={() => update()}
                                className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                            >
                                Switch to Mentor View
                            </button>
                        </div>
                    )}

                    {status === 'rejected' && (
                        <div className="space-y-2">
                            <p className="text-gray-600 text-sm">
                                Unfortunately, your application was not approved at this time.
                            </p>
                            {request.rejectionReason && (
                                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                                    <p className="text-xs font-bold text-red-800 uppercase mb-1">Feedback:</p>
                                    <p className="text-sm text-red-700">{request.rejectionReason}</p>
                                </div>
                            )}
                            <Link
                                href="/dashboard/mentor-apply"
                                className="inline-block text-sm text-[#5693C1] font-semibold hover:underline mt-2"
                            >
                                Re-apply with better credentials
                            </Link>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto">
                    {(!request || status === 'draft') && (
                        <Link
                            href="/dashboard/mentor-apply"
                            className="w-full px-6 py-2.5 bg-[#5693C1] text-white text-sm font-semibold rounded-lg hover:bg-[#4a80b0] transition-colors shadow-sm text-center"
                        >
                            {status === 'draft' ? 'Continue Application' : 'Apply Now'}
                        </Link>
                    )}

                    {status === 'submitted' && (
                        <div className="w-full px-6 py-2.5 bg-gray-100 text-gray-500 text-sm font-semibold rounded-lg text-center cursor-not-allowed">
                            Under Review
                        </div>
                    )}

                    {/* Withdraw Button */}
                    {(status === 'submitted' || status === 'draft' || status === 'rejected') && (
                        <button
                            onClick={handleWithdraw}
                            disabled={submitting}
                            className="w-full px-6 py-2.5 border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors text-center"
                        >
                            {submitting ? 'Withdrawing...' : 'Withdraw Application'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
