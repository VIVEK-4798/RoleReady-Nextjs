'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TicketStatusBadge from '@/components/tickets/TicketStatusBadge';
import TicketPriorityBadge from '@/components/tickets/TicketPriorityBadge';
import { ITicket } from '@/lib/models/Ticket';

interface TicketWithDetails extends Omit<ITicket, 'createdBy' | 'assignedTo'> {
    messageCount: number;
    createdBy: {
        _id: string;
        name: string;
        email: string;
    };
    assignedTo?: {
        _id: string;
        name: string;
    };
}

export default function AdminTicketList() {
    const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        search: '',
    });
    const [stats, setStats] = useState<any>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        hasMore: false,
        total: 0,
    });

    useEffect(() => {
        fetchTickets();
    }, [pagination.page, filters]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });

            if (filters.status !== 'all') params.append('status', filters.status);
            if (filters.priority !== 'all') params.append('priority', filters.priority);
            if (filters.search) params.append('search', filters.search);

            const res = await fetch(`/api/admin/tickets?${params}`);
            const data = await res.json();

            if (data.success) {
                setTickets(data.tickets);
                setStats(data.stats);
                setPagination({
                    page: data.pagination.page,
                    limit: data.pagination.limit,
                    hasMore: data.pagination.hasMore,
                    total: data.pagination.total,
                });
            }
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-gray-500 text-sm font-medium">Total Tickets</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-green-600 text-sm font-medium">Open</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.byStatus.open || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-yellow-600 text-sm font-medium">Waiting Reply</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.byStatus.waiting_user || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-blue-600 text-sm font-medium">In Progress</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.byStatus.in_progress || 0}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search tickets by subject or number..."
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#5693C1] focus:ring-[#5693C1] sm:text-sm p-2 border"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        className="rounded-md border-gray-300 shadow-sm focus:border-[#5693C1] focus:ring-[#5693C1] sm:text-sm p-2 border"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="waiting_user">Waiting User</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                    <select
                        className="rounded-md border-gray-300 shadow-sm focus:border-[#5693C1] focus:ring-[#5693C1] sm:text-sm p-2 border"
                        value={filters.priority}
                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                    >
                        <option value="all">All Priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            {/* Ticket Table */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#5693C1] border-t-transparent"></div>
                                    </td>
                                </tr>
                            ) : tickets.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        No tickets found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                tickets.map((ticket) => (
                                    <tr key={ticket._id.toString()} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#5693C1]">
                                            {ticket.ticketNumber}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                            {ticket.subject}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <TicketStatusBadge status={ticket.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <TicketPriorityBadge priority={ticket.priority} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{ticket.createdBy?.name || 'Unknown'}</span>
                                                <span className="text-xs text-gray-500 capitalize">{ticket.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {ticket.assignedTo ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                    {ticket.assignedTo.name}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(ticket.lastMessageAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                href={`/admin/tickets/${ticket._id}`}
                                                className="text-[#5693C1] hover:text-[#4a80b0]"
                                            >
                                                Manage
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {tickets.length > 0 && (
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between items-center">
                            <span className="text-sm text-gray-700">
                                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={!pagination.hasMore}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
