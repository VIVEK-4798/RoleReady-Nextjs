'use client';

/**
 * Admin Email Management Client Component
 * 
 * Allows admins to send emails to single or multiple recipients.
 * Features:
 * - Single email tab
 * - Bulk email tab with textarea and CSV upload
 * - Success/failure tracking
 */

import { useState, useRef, ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import { parseEmailsFromCSV, parseEmailsFromText } from '@/lib/utils/csvParser';
import RecipientSelector from '@/components/admin/RecipientSelector';

type Tab = 'single' | 'bulk';

export default function AdminEmailClient() {
    const [activeTab, setActiveTab] = useState<Tab>('single');

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#5693C1]/10 to-blue-400/10 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Email Management</h1>
                        <p className="mt-2 text-gray-600">
                            Send emails to users individually or in bulk
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                    <nav className="flex">
                        <button
                            onClick={() => setActiveTab('single')}
                            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'single'
                                ? 'text-[#5693C1] border-b-2 border-[#5693C1]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                <span>Single Email</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('bulk')}
                            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'bulk'
                                ? 'text-[#5693C1] border-b-2 border-[#5693C1]'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                                <span>Bulk Email</span>
                            </div>
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'single' ? (
                        <SingleEmailTab />
                    ) : (
                        <BulkEmailTab />
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Single Email Tab Component
 */

function SingleEmailTab() {
    const [recipient, setRecipient] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        // Validation
        if (!recipient.trim()) {
            toast.error('Please enter recipient email');
            return;
        }

        if (!subject.trim()) {
            toast.error('Please enter email subject');
            return;
        }

        if (!content.trim()) {
            toast.error('Please enter email content');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/admin/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipient, subject, content }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Email sent successfully!');
                // Clear form
                setRecipient('');
                setSubject('');
                setContent('');
            } else {
                toast.error(data.error || 'Failed to send email');
            }
        } catch (err) {
            toast.error('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Recipient Selector */}
            <RecipientSelector
                value={recipient}
                onChange={setRecipient}
                disabled={loading}
                onError={(msg) => toast.error(msg)}
            />

            {/* Subject */}
            <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                </label>
                <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-gray-900 placeholder-gray-500"
                    disabled={loading}
                />
            </div>

            {/* Content */}
            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your email content here..."
                    rows={10}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-gray-900 placeholder-gray-500 resize-none"
                    disabled={loading}
                />
                <p className="mt-2 text-xs text-gray-500">
                    Your content will be formatted in a professional email template
                </p>
            </div>

            {/* Send Button */}
            <button
                onClick={handleSend}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#5693C1] to-blue-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        Send Email
                    </span>
                )}
            </button>
        </div>
    );
}

/**
 * Bulk Email Tab Component
 */
function BulkEmailTab() {
    const [emailsText, setEmailsText] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<{ sent: number; failed: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.name.endsWith('.csv')) {
            toast.error('Please upload a CSV file');
            return;
        }

        // Read file
        const reader = new FileReader();
        reader.onload = (event) => {
            const csvContent = event.target?.result as string;
            const emails = parseEmailsFromCSV(csvContent);

            if (emails.length === 0) {
                toast.error('No valid emails found in CSV file');
                return;
            }

            // Add to textarea (comma separated)
            const currentEmails = emailsText.trim();
            const newEmails = emails.join(', ');
            setEmailsText(currentEmails ? `${currentEmails}, ${newEmails}` : newEmails);
            toast.success(`Added ${emails.length} emails from CSV`);
        };

        reader.onerror = () => {
            toast.error('Failed to read CSV file');
        };

        reader.readAsText(file);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSend = async () => {
        // Validation
        if (!emailsText.trim()) {
            toast.error('Please enter recipient emails');
            return;
        }

        if (!subject.trim()) {
            toast.error('Please enter email subject');
            return;
        }

        if (!content.trim()) {
            toast.error('Please enter email content');
            return;
        }

        // Parse emails
        const recipients = parseEmailsFromText(emailsText);

        if (recipients.length === 0) {
            toast.error('No valid email addresses found');
            return;
        }

        if (recipients.length > 200) {
            toast.error(`Too many recipients. Maximum 200 emails per request. You have ${recipients.length}.`);
            return;
        }

        setLoading(true);
        setStats(null);

        try {
            const response = await fetch('/api/admin/email/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipients, subject, content }),
            });

            const data = await response.json();

            if (data.success) {
                setStats({ sent: data.sent, failed: data.failed });
                toast.success(`Bulk email sent! ${data.sent} successful, ${data.failed} failed`);
                // Clear form
                setEmailsText('');
                setSubject('');
                setContent('');
            } else {
                toast.error(data.error || 'Failed to send bulk email');
            }
        } catch (err) {
            toast.error('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const emailCount = emailsText.trim() ? parseEmailsFromText(emailsText).length : 0;

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Email Input Methods */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipients
                </label>

                {/* Textarea */}
                <textarea
                    value={emailsText}
                    onChange={(e) => setEmailsText(e.target.value)}
                    placeholder="Enter emails separated by commas or new lines&#10;e.g. user1@example.com, user2@example.com"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-gray-900 placeholder-gray-500 resize-none"
                    disabled={loading}
                />

                {/* Email Count */}
                {emailCount > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {emailCount} {emailCount === 1 ? 'recipient' : 'recipients'}
                        </span>
                        {emailCount > 200 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Exceeds limit (max 200)
                            </span>
                        )}
                    </div>
                )}

                {/* CSV Upload */}
                <div className="mt-4 flex items-center gap-4">
                    <label
                        htmlFor="csv-upload"
                        className="inline-flex items-center px-5 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-[#5693C1] cursor-pointer transition-all"
                    >
                        <svg
                            className="w-5 h-5 mr-2 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                        Upload CSV File
                    </label>
                    <input
                        id="csv-upload"
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={loading}
                    />
                    <p className="text-xs text-gray-500">
                        CSV with email addresses (one per line or comma-separated)
                    </p>
                </div>
            </div>

            {/* Subject */}
            <div>
                <label htmlFor="bulk-subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                </label>
                <input
                    id="bulk-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject (same for all recipients)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-gray-900 placeholder-gray-500"
                    disabled={loading}
                />
            </div>

            {/* Content */}
            <div>
                <label htmlFor="bulk-content" className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                </label>
                <textarea
                    id="bulk-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Email content (same for all recipients)..."
                    rows={10}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent text-gray-900 placeholder-gray-500 resize-none"
                    disabled={loading}
                />
            </div>

            {/* Stats Display */}
            {stats && (
                <div className="bg-gradient-to-r from-[#5693C1]/10 to-blue-400/10 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#5693C1]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Email Results
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                            <p className="text-3xl font-bold text-green-600">{stats.sent}</p>
                            <p className="text-sm text-gray-600 mt-1">Sent Successfully</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-red-200">
                            <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
                            <p className="text-sm text-gray-600 mt-1">Failed</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Send Button */}
            <button
                onClick={handleSend}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#5693C1] to-blue-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending to {emailCount} recipients...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        Send Bulk Email
                    </span>
                )}
            </button>

            {/* Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-amber-800">
                        <p className="font-semibold mb-1">Important Notes:</p>
                        <ul className="list-disc list-inside space-y-1 text-amber-700">
                            <li>Maximum 200 recipients per request</li>
                            <li>Emails are automatically deduplicated</li>
                            <li>Invalid emails are skipped</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
