'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks';
import TicketStatusBadge from './TicketStatusBadge';
import TicketPriorityBadge from './TicketPriorityBadge';
import { ITicket } from '@/lib/models/Ticket';
import { ITicketMessage } from '@/lib/models/TicketMessage';

interface TicketChatProps {
    ticketId: string;
    basePath: string; // e.g., '/dashboard/tickets' or '/mentor/tickets'
}

interface TicketDetail extends ITicket {
    messageCount: number;
}

export default function TicketChat({ ticketId, basePath }: TicketChatProps) {
    const { user } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [ticket, setTicket] = useState<TicketDetail | null>(null);
    const [messages, setMessages] = useState<ITicketMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTicketDetails = async () => {
        try {
            const res = await fetch(`/api/tickets/${ticketId}`);
            if (!res.ok) throw new Error('Failed to fetch ticket');

            const data = await res.json();
            if (data.success) {
                setTicket(data.ticket);
                setMessages(data.messages || []);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load ticket details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicketDetails();
    }, [ticketId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim() || sending) return;

        setSending(true);
        try {
            const res = await fetch(`/api/tickets/${ticketId}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: replyMessage }),
            });

            const data = await res.json();

            if (data.success) {
                setMessages([...messages, data.message]);
                setTicket(prev => prev ? { ...prev, status: data.ticket.status } : null);
                setReplyMessage('');
            } else {
                alert(data.error || 'Failed to send reply');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5693C1]"></div>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">Error loading ticket</h3>
                <p className="mt-2 text-sm text-gray-500">{error || 'Ticket not found'}</p>
            </div>
        );
    }

    const isClosed = ticket.status === 'closed';

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-h-[800px] bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-gray-900">
                                {ticket.subject}
                            </h1>
                            <span className="text-sm text-gray-500">#{ticket.ticketNumber}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                            <TicketStatusBadge status={ticket.status} />
                            <TicketPriorityBadge priority={ticket.priority} />
                            <span className="text-gray-500 capitalize">{ticket.category}</span>
                            <span className="text-gray-400">
                                Created {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                {messages.map((msg) => {

                    const senderId = typeof msg.senderId === 'object' ? (msg.senderId as any)._id : msg.senderId;
                    const isCurrentUser = String(senderId) === String(user?.id);

                    const isAdmin = msg.senderRole === 'admin';

                    return (
                        <div
                            key={msg._id.toString()}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${isCurrentUser
                                    ? 'bg-[#5693C1] text-white rounded-br-none'
                                    : isAdmin
                                        ? 'bg-purple-50 border border-purple-100 text-gray-800 rounded-bl-none'
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                                    }`}
                            >
                                {!isCurrentUser && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-bold ${isAdmin ? 'text-purple-600' : 'text-gray-600'}`}>
                                            {msg.senderRole === 'admin' ? 'Support Team' : (msg.senderId as any)?.name}
                                        </span>
                                        {isAdmin && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
                                                Admin
                                            </span>
                                        )}
                                    </div>
                                )}

                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {msg.message}
                                </p>

                                <div
                                    className={`mt-2 text-[10px] flex items-center gap-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-400'
                                        }`}
                                >
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isCurrentUser && <span>• You</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Reply Box */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                {isClosed ? (
                    <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-500 text-sm">
                        This ticket has been closed. You can create a new ticket if you need further assistance.
                    </div>
                ) : (
                    <form onSubmit={handleReply} className="flex gap-4">
                        <div className="flex-1">
                            <textarea
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="Type your reply..."
                                className="w-full rounded-lg border-gray-300 focus:border-[#5693C1] focus:ring-[#5693C1] resize-none py-3 px-4 text-sm text-gray-900 placeholder-gray-400"
                                rows={2}
                                disabled={sending}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleReply(e);
                                    }
                                }}
                            />
                            <p className="mt-1 text-xs text-gray-400 text-right">
                                Press Enter to send, Shift+Enter for new line
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={!replyMessage.trim() || sending}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#5693C1] hover:bg-[#4a80b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5693C1] disabled:opacity-50 disabled:cursor-not-allowed h-fit self-end mb-6"
                        >
                            {sending ? (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                <svg className="-ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                            Send
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
