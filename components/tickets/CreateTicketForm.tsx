'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TicketCategory, TicketPriority } from '@/lib/models/Ticket';

interface CreateTicketFormProps {
    basePath: string; // e.g., '/dashboard/tickets' or '/mentor/tickets'
}

export default function CreateTicketForm({ basePath }: CreateTicketFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        subject: '',
        category: 'other' as TicketCategory,
        priority: 'medium' as TicketPriority,
        message: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                // Redirect to new ticket
                router.push(`${basePath}/${data.ticket._id}`);
            } else {
                setError(data.error || 'Failed to create ticket');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6 max-w-3xl mx-auto">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New Ticket</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Describe your issue or request clearly to help us assist you better.
                </p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Subject */}
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                        Subject
                    </label>
                    <input
                        type="text"
                        id="subject"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5693C1] focus:ring-[#5693C1] sm:text-sm p-3 border"
                        placeholder="Brief summary of the issue"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                </div>

                {/* Category & Priority Row */}
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    {/* Category */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                            Category
                        </label>
                        <select
                            id="category"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5693C1] focus:ring-[#5693C1] sm:text-sm p-3 border"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as TicketCategory })}
                        >
                            <option value="other">Other</option>
                            <option value="bug">Bug Report</option>
                            <option value="feature">Feature Request</option>
                            <option value="account">Account Issue</option>
                            <option value="payment">Billing/Payment</option>
                        </select>
                    </div>

                    {/* Priority */}
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                            Priority
                        </label>
                        <select
                            id="priority"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5693C1] focus:ring-[#5693C1] sm:text-sm p-3 border"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TicketPriority })}
                        >
                            <option value="low">Low - General inquiry</option>
                            <option value="medium">Medium - Valid issue</option>
                            <option value="high">High - Blocking issue</option>
                        </select>
                    </div>
                </div>

                {/* Message */}
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        id="message"
                        required
                        rows={6}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5693C1] focus:ring-[#5693C1] sm:text-sm p-3 border"
                        placeholder="Please provide detailed information about your request..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5693C1]"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5693C1] hover:bg-[#4a80b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5693C1] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create Ticket'}
                    </button>
                </div>
            </form>
        </div>
    );
}
