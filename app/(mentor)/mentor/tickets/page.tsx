import { Metadata } from 'next';
import TicketList from '@/components/tickets/TicketList';

export const metadata: Metadata = {
    title: 'Mentor Support | RoleReady',
    description: 'View and manage your mentor support requests',
};

export default function TicketListPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Mentor Support</h1>
                <p className="text-gray-500">
                    Need assistance? Create a ticket for the support team.
                </p>
            </div>

            <TicketList basePath="/mentor/tickets" />
        </div>
    );
}
