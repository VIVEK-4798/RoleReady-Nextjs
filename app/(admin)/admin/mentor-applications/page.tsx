'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface Application {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        image?: string;
    };
    status: string;
    submittedAt: string;
    experience: {
        currentTitle: string;
        yearsOfExperience: number;
    };
    expertise: {
        primarySkills: string[];
    };
}

export default function AdminApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const res = await fetch('/api/admin/mentor-applications');
            const data = await res.json();
            if (data.success) {
                setApplications(data.data);
            }
        } catch (error) {
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
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
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mentor Applications</h1>
                    <p className="text-gray-500 mt-1">Review detailed profiles and proof of expertise from candidates.</p>
                </div>
                <div className="bg-[#5693C1]/10 px-4 py-2 rounded-lg">
                    <span className="text-[#5693C1] font-semibold">{applications.length} Pending Review</span>
                </div>
            </div>

            {applications.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                    <p className="text-gray-500">There are no pending mentor applications to review.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Candidate</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Experience</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Expertise</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {applications.map((app) => (
                                <tr key={app._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-[#5693C1] font-bold mr-3 overflow-hidden">
                                                {app.userId?.image ? <img src={app.userId.image} alt="" className="w-full h-full object-cover" /> : app.userId?.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{app.userId?.name}</div>
                                                <div className="text-xs text-gray-500">{app.userId?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 font-medium">{app.experience?.currentTitle}</div>
                                        <div className="text-xs text-gray-500">{app.experience?.yearsOfExperience} years exp</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {app.expertise?.primarySkills.slice(0, 3).map((s, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">
                                                    {s}
                                                </span>
                                            ))}
                                            {app.expertise?.primarySkills.length > 3 && <span className="text-[10px] text-gray-400">+{app.expertise.primarySkills.length - 3} more</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(app.submittedAt), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={`/admin/mentor-applications/${app._id}`} className="text-[#5693C1] hover:text-blue-700 font-bold">
                                            Review →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
