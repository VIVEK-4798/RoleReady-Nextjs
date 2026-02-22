'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    MoreVertical,
    Eye,
    CheckCircle2,
    Clock,
    AlertCircle,
    Trash2,
    ChevronLeft,
    ChevronRight,
    X,
    User,
    Mail,
    Calendar,
    MessageSquare,
    Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface Feedback {
    _id: string;
    type: 'suggestion' | 'issue' | 'praise' | 'other';
    email: string;
    message: string;
    userId?: {
        _id: string;
        name: string;
        email: string;
    };
    status: 'new' | 'reviewed' | 'resolved';
    createdAt: string;
}

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function AdminFeedbackClient() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState(''); // Actual query used for fetch
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchFeedback = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(filterType !== 'all' && { type: filterType }),
                ...(filterStatus !== 'all' && { status: filterStatus }),
                ...(searchQuery && { search: searchQuery }),
            });

            const response = await fetch(`/api/admin/feedback?${params.toString()}`);
            const data = await response.json();

            if (response.ok) {
                setFeedbacks(data.feedbacks);
                setPagination(data.pagination);
            } else {
                toast.error(data.error || 'Failed to fetch feedback');
            }
        } catch (error) {
            console.error('Error fetching feedback:', error);
            toast.error('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, filterType, filterStatus, searchQuery]);

    useEffect(() => {
        fetchFeedback();
    }, [fetchFeedback]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchQuery(search);
        setPage(1);
    };

    const updateStatus = async (id: string, newStatus: string) => {
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/admin/feedback/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`Marked as ${newStatus}`);
                setFeedbacks(prev => prev.map(f => f._id === id ? data : f));
                if (selectedFeedback?._id === id) {
                    setSelectedFeedback(data);
                }
            } else {
                toast.error(data.error || 'Failed to update status');
            }
        } catch (error) {
            toast.error('Update failed');
        } finally {
            setIsUpdating(false);
        }
    };

    const deleteFeedback = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this feedback?')) return;

        try {
            const response = await fetch(`/api/admin/feedback/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Feedback deleted');
                setFeedbacks(prev => prev.filter(f => f._id !== id));
                setSelectedFeedback(null);
                // If the last item on the page was deleted, go to previous page
                if (feedbacks.length === 1 && page > 1) {
                    setPage(page - 1);
                }
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to delete feedback');
            }
        } catch (error) {
            toast.error('Deletion failed');
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'suggestion': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'issue': return 'bg-red-50 text-red-600 border-red-100';
            case 'praise': return 'bg-green-50 text-green-600 border-green-100';
            case 'other': return 'bg-gray-100 text-gray-600 border-gray-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new': return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    New
                </span>
            );
            case 'reviewed': return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                    <Clock className="w-3 h-3" />
                    Reviewed
                </span>
            );
            case 'resolved': return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3" />
                    Resolved
                </span>
            );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/30 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">User Feedback</h1>
                    <p className="text-gray-500">Review and manage platform feedback submissions.</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by email or message..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1]/20 transition-all text-sm"
                            />
                        </form>
                        <div className="flex flex-wrap gap-3">
                            <select
                                value={filterType}
                                onChange={(e) => {
                                    setFilterType(e.target.value);
                                    setPage(1);
                                }}
                                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#5693C1]/20"
                            >
                                <option value="all">All Types</option>
                                <option value="suggestion">Suggestions</option>
                                <option value="issue">Issues</option>
                                <option value="praise">Praise</option>
                                <option value="other">Other</option>
                            </select>
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setPage(1);
                                }}
                                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#5693C1]/20"
                            >
                                <option value="all">All Status</option>
                                <option value="new">New</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            {[...Array(6)].map((_, j) => (
                                                <td key={j} className="px-6 py-4">
                                                    <div className="h-4 bg-gray-100 rounded w-full" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : feedbacks.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <div className="max-w-xs mx-auto">
                                                <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                                <p className="font-semibold text-gray-900 mb-1">No feedback yet</p>
                                                <p className="text-sm">We'll notify you when new feedback arrives.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    feedbacks.map((feedback) => (
                                        <tr key={feedback._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getTypeColor(feedback.type)}`}>
                                                    {feedback.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 group">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-700">{feedback.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <p className="text-sm text-gray-600 truncate">{feedback.message}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(feedback.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-500">
                                                    {format(new Date(feedback.createdAt), 'MMM d, yyyy')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedFeedback(feedback)}
                                                        className="p-2 hover:bg-white hover:shadow-md hover:text-[#5693C1] text-gray-400 rounded-lg transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {feedback.status !== 'resolved' && (
                                                        <button
                                                            onClick={() => updateStatus(feedback._id, feedback.status === 'new' ? 'reviewed' : 'resolved')}
                                                            className="p-2 hover:bg-white hover:shadow-md hover:text-green-600 text-gray-400 rounded-lg transition-all"
                                                            title={feedback.status === 'new' ? 'Mark as Reviewed' : 'Mark as Resolved'}
                                                        >
                                                            {feedback.status === 'new' ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> entries
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {[...Array(pagination.totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === i + 1
                                            ? 'bg-[#5693C1] text-white shadow-md'
                                            : 'hover:bg-gray-50 border border-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={page === pagination.totalPages}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedFeedback && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedFeedback(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl border ${getTypeColor(selectedFeedback.type)}`}>
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Feedback Details</h3>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{selectedFeedback.type}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedFeedback(null)}
                                    className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6">
                                <div className="space-y-6">
                                    {/* Email and User Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</p>
                                            <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <Mail className="w-4 h-4 text-[#5693C1]" />
                                                <p className="text-sm font-medium text-gray-900">{selectedFeedback.email}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Submission Date</p>
                                            <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <Calendar className="w-4 h-4 text-[#5693C1]" />
                                                <p className="text-sm font-medium text-gray-900">
                                                    {format(new Date(selectedFeedback.createdAt), 'MMMM d, yyyy h:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Associated User if exists */}
                                    {selectedFeedback.userId && (
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Submitted By</p>
                                            <div className="flex items-center gap-3 py-3 px-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-blue-100 shadow-sm">
                                                    <User className="w-5 h-5 text-[#5693C1]" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{selectedFeedback.userId.name}</p>
                                                    <p className="text-xs text-gray-500">{selectedFeedback.userId.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Message */}
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Message Content</p>
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                                {selectedFeedback.message}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status Management */}
                                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-gray-600 mr-2">Current Status:</p>
                                            <select
                                                value={selectedFeedback.status}
                                                onChange={(e) => updateStatus(selectedFeedback._id, e.target.value)}
                                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5693C1]/20"
                                                disabled={isUpdating}
                                            >
                                                <option value="new">New</option>
                                                <option value="reviewed">Reviewed</option>
                                                <option value="resolved">Resolved</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => deleteFeedback(selectedFeedback._id)}
                                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete Entry
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
