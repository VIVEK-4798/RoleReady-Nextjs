'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import TicketStatusBadge from '@/components/tickets/TicketStatusBadge';
import TicketPriorityBadge from '@/components/tickets/TicketPriorityBadge';
import { ITicket } from '@/lib/models/Ticket';
import { ITicketMessage } from '@/lib/models/TicketMessage';

interface AdminTicketDetailProps {
    ticketId: string;
}

interface TicketDetail extends Omit<ITicket, 'createdBy' | 'assignedTo'> {
    messageCount: number;
    createdBy: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    assignedTo?: {
        _id: string;
        name: string;
    };
}

export default function AdminTicketDetail({ ticketId }: AdminTicketDetailProps) {
    const router = useRouter();
    const { user } = useAuth(); // Add hook
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [ticket, setTicket] = useState<TicketDetail | null>(null);
    const [messages, setMessages] = useState<ITicketMessage[]>([]);
    const [internalNotes, setInternalNotes] = useState<ITicketMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [sending, setSending] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);

    const handleAssignToMe = async () => {
        if (assigning || !user) return;
        handleAssign(user.id);
    };

    useEffect(() => {
        fetchTicketDetails();
    }, [ticketId]);

    const fetchTicketDetails = async () => {
        try {
            const res = await fetch(`/api/admin/tickets/${ticketId}`);
            const data = await res.json();
            if (data.success) {
                setTicket(data.ticket);
                setMessages(data.messages || []);
                setInternalNotes(data.internalNotes || []);
            }
        } catch (error) {
            console.error('Failed to load ticket:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim() || sending) return;

        setSending(true);
        try {
            const res = await fetch(`/api/admin/tickets/${ticketId}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: replyMessage,
                    isInternal,
                }),
            });

            const data = await res.json();

            if (data.success) {
                if (isInternal) {
                    setInternalNotes([...internalNotes, data.message]);
                } else {
                    setMessages([...messages, data.message]);
                }

                // Update ticket status/assignee if changed
                if (data.ticket) {
                    setTicket(prev => prev ? { ...prev, ...data.ticket } : null);
                }

                setReplyMessage('');
                setIsInternal(false);
            }
        } catch (error) {
            console.error('Failed to send reply:', error);
        } finally {
            setSending(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (statusUpdating) return;
        setStatusUpdating(true);
        try {
            const res = await fetch(`/api/admin/tickets/${ticketId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                setTicket(prev => prev ? { ...prev, status: data.ticket.status } : null);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleAssign = async (adminId: string | null) => {
        if (assigning) return;
        setAssigning(true);
        try {
            const res = await fetch(`/api/admin/tickets/${ticketId}/assign`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId }),
            });
            const data = await res.json();
            if (data.success) {
                setTicket(prev => prev ? { ...prev, assignedTo: data.ticket.assignedTo } : null);
            }
        } catch (error) {
            console.error('Failed to assign ticket:', error);
        } finally {
            setAssigning(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading ticket details...</div>;
    if (!ticket) return <div className="p-8 text-center text-red-500">Ticket not found</div>;

    const allMessages = [...messages, ...internalNotes].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
            {/* Main Chat Area */}
            <div className="lg:col-span-2 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 h-full">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            {ticket.subject}
                            <span className="text-sm font-normal text-gray-500">#{ticket.ticketNumber}</span>
                        </h2>
                        <p className="text-sm text-gray-500">
                            Created by <span className="font-medium text-gray-900">{ticket.createdBy.name}</span> ({ticket.createdBy.email})
                        </p>
                    </div>
                    <TicketStatusBadge status={ticket.status} />
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                    {allMessages.map((msg) => {
                        const isAdmin = msg.senderRole === 'admin';
                        const isNote = msg.isInternal;

                        return (
                            <div
                                key={msg._id.toString()}
                                className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${isNote
                                        ? 'bg-yellow-50 border border-yellow-200 text-yellow-900'
                                        : isAdmin
                                            ? 'bg-[#5693C1] text-white rounded-br-none'
                                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1 gap-4">
                                        <span className={`text-xs font-bold ${isAdmin ? (isNote ? 'text-yellow-700' : 'text-blue-100') : 'text-gray-600'}`}>
                                            {isNote ? 'INTERNAL NOTE' : (isAdmin ? 'Agent' : ticket.createdBy.name)}
                                        </span>
                                        <span className={`text-[10px] ${isAdmin ? (isNote ? 'text-yellow-700' : 'text-blue-100') : 'text-gray-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                        {msg.message}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Reply Box */}
                <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                    <form onSubmit={handleReply} className="space-y-3">
                        <div className="flex items-center gap-4 text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isInternal}
                                    onChange={(e) => setIsInternal(e.target.checked)}
                                    className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                                />
                                <span className={`font-medium ${isInternal ? 'text-yellow-700' : 'text-gray-600'}`}>
                                    Internal Note (Visible to Admins only)
                                </span>
                            </label>
                        </div>

                        <div className="flex gap-4">
                            <textarea
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder={isInternal ? "Add an internal note..." : "Type a public reply..."}
                                className={`w-full rounded-lg border-gray-300 focus:ring-2 resize-none py-3 px-4 text-sm ${isInternal
                                    ? 'bg-yellow-50 focus:border-yellow-500 focus:ring-yellow-200'
                                    : 'focus:border-[#5693C1] focus:ring-[#5693C1]/20'
                                    }`}
                                rows={3}
                                disabled={sending}
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={!replyMessage.trim() || sending}
                                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${isInternal
                                    ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                                    : 'bg-[#5693C1] hover:bg-[#4a80b0] focus:ring-[#5693C1]'
                                    }`}
                            >
                                {sending ? 'Sending...' : (isInternal ? 'Add Note' : 'Send Reply')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Sidebar Controls */}
            <div className="space-y-6">
                {/* Status Control */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Ticket Status</h3>
                    <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={statusUpdating}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#5693C1] focus:ring-[#5693C1] sm:text-sm p-2 border"
                    >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="waiting_user">Waiting for User</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                {/* Assignment Control */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Assignment</h3>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500">Currently assigned to:</span>
                        {ticket.assignedTo ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {ticket.assignedTo.name}
                            </span>
                        ) : (
                            <span className="text-sm text-gray-400 italic">Unassigned</span>
                        )}
                    </div>

                    {ticket.assignedTo ? (
                        <button
                            onClick={() => handleAssign(null)}
                            disabled={assigning}
                            className="w-full justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5693C1]"
                        >
                            Unassign
                        </button>
                    ) : (
                        // Ideally fetch list of admins here, for now just a generic "Assign to Me" button
                        // Or we could implement a dropdown if we had a list of admins
                        <button
                            onClick={handleAssignToMe}
                            disabled={assigning}
                            className="w-full flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#5693C1] hover:bg-[#4a80b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5693C1]"
                        >
                            Assign to Me
                        </button>
                    )}
                </div>

                {/* User Info */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">User Details</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-500">Name</p>
                            <p className="text-sm font-medium text-gray-900">{ticket.createdBy.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm font-medium text-gray-900">{ticket.createdBy.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Role</p>
                            <p className="text-sm font-medium text-gray-900 capitalize">{ticket.createdBy.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
