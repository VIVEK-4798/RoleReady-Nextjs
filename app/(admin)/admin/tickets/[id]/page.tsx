import { Metadata } from 'next';
import AdminTicketDetail from '@/components/admin/tickets/AdminTicketDetail';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
    title: 'Manage Ticket | Admin Portal',
    description: 'View ticket details and communicate with user',
};

export default async function AdminTicketDetailPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/tickets"
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Ticket Management</h1>
            </div>

            <AdminTicketDetail ticketId={id} />
        </div>
    );
}
