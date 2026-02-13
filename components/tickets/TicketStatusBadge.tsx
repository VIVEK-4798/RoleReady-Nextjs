import { TicketStatus } from '@/lib/models/Ticket';

interface TicketStatusBadgeProps {
    status: TicketStatus;
}

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
    open: {
        label: 'Open',
        className: 'bg-green-100 text-green-800 border-green-200',
    },
    in_progress: {
        label: 'In Progress',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    waiting_user: {
        label: 'Waiting for You',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    resolved: {
        label: 'Resolved',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
    },
    closed: {
        label: 'Closed',
        className: 'bg-gray-100 text-gray-800 border-gray-200 opacity-60',
    },
};

export default function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.open;

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
        >
            {config.label}
        </span>
    );
}
