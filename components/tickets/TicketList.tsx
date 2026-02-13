'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TicketStatusBadge from './TicketStatusBadge';
import TicketPriorityBadge from './TicketPriorityBadge';
import { ITicket } from '@/lib/models/Ticket';

interface TicketListProps {
    basePath: string; // e.g., '/dashboard/tickets' or '/mentor/tickets'
}

interface TicketWithCount extends ITicket {
    messageCount: number;
}

export default function TicketList({ basePath }: TicketListProps) {
    const router = useRouter();
    const [tickets, setTickets] = useState<TicketWithCount[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        hasMore: false,
    });

    useEffect(() => {
        fetchTickets();
    }, [pagination.page, statusFilter]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });

            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }

            const res = await fetch(`/api/tickets/my?${params}`);
            const data = await res.json();

            if (data.success) {
                setTickets(data.tickets);
                setPagination(prev => ({
                    ...prev,
                    hasMore: data.pagination.hasMore,
                }));
            }
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
                <Link
                    href={`${basePath}/new`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#5693C1] hover:bg-[#4a80b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5693C1]"
                >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Ticket
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* Filters */}
                <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
                    <div className="flex items-center space-x-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#5693C1] focus:border-[#5693C1] sm:text-sm rounded-md"
                        >
                            <option value="all">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="waiting_user">Waiting for Reply</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>

                {/* List */}
                <div className="min-w-full divide-y divide-gray-200">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#5693C1] border-t-transparent"></div>
                            <p className="mt-2 text-gray-500">Loading tickets...</p>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="p-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new support ticket.</p>
                            <div className="mt-6">
                                <Link
                                    href={`${basePath}/new`}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#5693C1] hover:bg-[#4a80b0]"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    New Ticket
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {tickets.map((ticket) => (
                                <li key={ticket._id.toString()}>
                                    <Link
                                        href={`${basePath}/${ticket._id}`}
                                        className="block hover:bg-gray-50 transition duration-150 ease-in-out"
                                    >
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center truncate">
                                                    <p className="text-sm font-medium text-[#5693C1] truncate">
                                                        {ticket.ticketNumber}
                                                    </p>
                                                    <p className="ml-4 truncate text-sm font-medium text-gray-900">
                                                        {ticket.subject}
                                                    </p>
                                                </div>
                                                <div className="ml-2 flex-shrink-0 flex">
                                                    <TicketStatusBadge status={ticket.status} />
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-500">
                                                        <TicketPriorityBadge priority={ticket.priority} />
                                                        <span className="ml-2 capitalize text-gray-500">
                                                            {ticket.category}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                    </svg>
                                                    <p>
                                                        {ticket.messageCount} message{ticket.messageCount !== 1 ? 's' : ''}
                                                    </p>
                                                    <p className="ml-6 flex items-center">
                                                        Last active: {new Date(ticket.lastMessageAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Pagination */}
                {tickets.length > 0 && (
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-700 self-center">
                                Page {pagination.page}
                            </span>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={!pagination.hasMore}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
