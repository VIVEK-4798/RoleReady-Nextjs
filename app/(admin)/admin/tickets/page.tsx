import { Metadata } from 'next';
import AdminTicketList from '@/components/admin/tickets/AdminTicketList';

export const metadata: Metadata = {
    title: 'Ticket Management | Admin Portal',
    description: 'Manage support tickets and user requests',
};

export default function AdminTicketsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Ticket Management</h1>
                <p className="text-gray-500">
                    View, assign, and resolve support tickets from users and mentors.
                </p>
            </div>

            <AdminTicketList />
        </div>
    );
}
