'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ConfirmationModal } from '@/components/ui';

export default function AdminApplicationDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [application, setApplication] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        try {
            const res = await fetch(`/api/admin/mentor-applications/${id}`);
            const data = await res.json();
            if (data.success) {
                setApplication(data.data);
            }
        } catch (error) {
            toast.error('Failed to load application details');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = () => {
        setShowApproveModal(true);
    };

    const confirmApprove = async () => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/mentor-applications/${id}/approve`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Application approved! User is now a mentor.');
                setShowApproveModal(false);
                router.push('/admin/mentor-applications');
            } else {
                toast.error(data.message || 'Approval failed');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/mentor-applications/${id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectionReason })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Application rejected');
                router.push('/admin/mentor-applications');
            } else {
                toast.error(data.message || 'Rejection failed');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5693C1]"></div>
            </div>
        );
    }

    if (!application) return <div className="p-8 text-center">Application not found</div>;

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <button onClick={() => router.back()} className="text-[#5693C1] text-sm font-bold mb-2 flex items-center gap-1">
                        ← Back to Applications
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Application Review</h1>
                    <p className="text-gray-500">Submitted by {application.userId?.name} on {format(new Date(application.submittedAt), 'MMMM do, yyyy')}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={actionLoading}
                        className="px-6 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                    >
                        Reject
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-100 disabled:opacity-50"
                    >
                        Approve Candidate
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Detailed Info Sections */}
                    <AdminSection title="Professional Identity">
                        <DetailItem label="LinkedIn" value={application.professionalIdentity?.linkedinUrl} isLink />
                        <DetailItem label="GitHub" value={application.professionalIdentity?.githubUrl} isLink />
                        <DetailItem label="Portfolio" value={application.professionalIdentity?.portfolioUrl} isLink />
                        <DetailItem label="Company Email" value={application.professionalIdentity?.companyEmail} />
                    </AdminSection>

                    <AdminSection title="Experience & Background">
                        <DetailItem label="Current Title" value={application.experience?.currentTitle} />
                        <DetailItem label="Years of Experience" value={application.experience?.yearsOfExperience} />
                        <DetailList label="Notable Companies" items={application.experience?.companies} />
                        <DetailList label="Domains" items={application.experience?.domains} />
                    </AdminSection>

                    <AdminSection title="Expertise & Skills">
                        <DetailList label="Primary Skills" items={application.expertise?.primarySkills} highlighted />
                        <DetailList label="Mentoring Areas" items={application.expertise?.mentoringAreas} />
                    </AdminSection>

                    <AdminSection title="Work Proof & Impact">
                        <DetailList label="Project Links" items={application.workProof?.projectLinks} isLink />
                        <DetailList label="Achievements" items={application.workProof?.achievements} />
                    </AdminSection>

                    <AdminSection title="Intent & Motivation">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 italic text-sm text-gray-700">
                            "{application.intent?.motivation}"
                        </div>
                    </AdminSection>
                </div>

                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Engagement Plan</h3>
                        <DetailItem label="Hours per Week" value={application.availability?.hoursPerWeek} />
                        <DetailItem label="Target Mentees" value={application.availability?.preferredMenteeLevel} />
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                        <h3 className="font-bold text-[#5693C1] mb-2 uppercase text-xs tracking-wider">Candidate Summary</h3>
                        <div className="flex items-center gap-3 mt-4">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-bold text-[#5693C1] border border-blue-200 overflow-hidden">
                                {application.userId?.image ? <img src={application.userId.image} alt="" className="w-full h-full object-cover" /> : application.userId?.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{application.userId?.name}</p>
                                <p className="text-xs text-gray-500">{application.userId?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Reject Application</h3>
                        <p className="text-sm text-gray-500 mb-6">Please provide constructive feedback. This will be sent to the candidate.</p>
                        <textarea
                            className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5693C1] text-sm"
                            placeholder="e.g. Please provide more specific links to your technical work or verify your company email..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="px-6 py-2 text-sm text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectionReason.trim() || actionLoading}
                                className="px-6 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-50 shadow-lg shadow-red-100"
                            >
                                Send Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Approve Confirmation Modal */}
            <ConfirmationModal
                isOpen={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                onConfirm={confirmApprove}
                title="Approve Mentor Application"
                message="Are you sure you want to approve this mentor? They will gain access to mentor features immediately."
                confirmText="Approve Candidate"
                cancelText="Cancel"
                type="success"
                isLoading={actionLoading}
            />
        </div>
    );
}

// Helper Components
function AdminSection({ title, children }: any) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-50 pb-4">{title}</h3>
            <div className="space-y-6">{children}</div>
        </div>
    );
}

function DetailItem({ label, value, isLink }: any) {
    if (!value) return null;
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
            {isLink ? (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#5693C1] hover:underline">
                    {value}
                </a>
            ) : (
                <span className="text-sm font-medium text-gray-700 capitalize">{value}</span>
            )}
        </div>
    );
}

function DetailList({ label, items, highlighted, isLink }: any) {
    if (!items || items.length === 0) return null;
    return (
        <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
            <div className="flex flex-wrap gap-2">
                {items.map((item: string, i: number) => (
                    isLink ? (
                        <a key={i} href={item} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-blue-50 text-[#5693C1] text-xs font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition">
                            {item}
                        </a>
                    ) : (
                        <span key={i} className={`px-3 py-1 text-xs font-bold rounded-lg border ${highlighted ? 'bg-[#5693C1] text-white border-blue-400' : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                            {item}
                        </span>
                    )
                ))}
            </div>
        </div>
    );
}
