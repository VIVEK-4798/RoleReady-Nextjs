import { Metadata } from 'next';
import CreateTicketForm from '@/components/tickets/CreateTicketForm';

export const metadata: Metadata = {
    title: 'Create Ticket | RoleReady',
    description: 'Create a new support ticket',
};

export default function NewTicketPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Create Support Ticket</h1>
                <p className="text-gray-500">
                    Describe the issue you're facing and we'll help you resolve it.
                </p>
            </div>

            <CreateTicketForm basePath="/dashboard/tickets" />
        </div>
    );
}
