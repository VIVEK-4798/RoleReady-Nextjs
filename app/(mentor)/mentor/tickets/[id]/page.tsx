import { Metadata } from 'next';
import TicketChat from '@/components/tickets/TicketChat';

interface PageProps {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
    title: 'Ticket Details | RoleReady',
    description: 'View ticket conversation and details',
};

export default async function TicketDetailPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <div className="space-y-6 h-full">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Support Conversation</h1>
            </div>

            <TicketChat ticketId={id} basePath="/mentor/tickets" />
        </div>
    );
}
