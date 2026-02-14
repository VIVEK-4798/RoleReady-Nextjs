'use client';

import { useState, useEffect } from 'react';
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
            const res = await fetch('/api/mentor-role/me', { cache: 'no-store' });
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

    const handleApply = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/mentor-role/request', {
                method: 'POST',
                cache: 'no-store'
            });
            const data = await res.json();

            if (data.success) {
                toast.success('Application submitted successfully!');
                setRequest(data.data);
            } else {
                const errorMsg = data.error || data.message || 'Failed to submit application';
                toast.error(errorMsg);

                // If the error indicates a request already exists, sync the UI
                if (errorMsg.includes('already') || errorMsg.includes('pending')) {
                    fetchRequestStatus();
                }
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    if (userRole !== 'user') return null;
    if (loading) return null;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                        Become a Mentor
                        {request?.status === 'pending' && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full uppercase">
                                Pending Review
                            </span>
                        )}
                        {request?.status === 'approved' && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full uppercase">
                                Approved
                            </span>
                        )}
                        {request?.status === 'rejected' && (
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

                    {request?.status === 'pending' && (
                        <p className="text-gray-600 text-sm">
                            Your application is currently under review by our administration team. We'll notify you once a decision is made.
                        </p>
                    )}

                    {request?.status === 'approved' && (
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

                    {request?.status === 'rejected' && (
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
                            <button
                                onClick={handleApply}
                                disabled={submitting}
                                className="text-sm text-[#5693C1] font-semibold hover:underline mt-2"
                            >
                                Re-apply with better credentials
                            </button>
                        </div>
                    )}
                </div>

                {!request && (
                    <button
                        onClick={handleApply}
                        disabled={submitting}
                        className="w-full md:w-auto px-6 py-2.5 bg-[#5693C1] text-white font-semibold rounded-lg hover:bg-[#4a80b0] transition-colors disabled:opacity-50 shadow-sm"
                    >
                        {submitting ? 'Applying...' : 'Apply Now'}
                    </button>
                )}
            </div>
        </div>
    );
}
