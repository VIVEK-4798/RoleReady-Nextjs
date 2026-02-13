import { Metadata } from 'next';
import TicketList from '@/components/tickets/TicketList';

export const metadata: Metadata = {
    title: 'Support Tickets | RoleReady',
    description: 'View and manage your support requests',
};

export default function TicketsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
                <p className="text-gray-500">
                    Need help? View your existing tickets or create a new one.
                </p>
            </div>

            <TicketList basePath="/dashboard/tickets" />
        </div>
    );
}
