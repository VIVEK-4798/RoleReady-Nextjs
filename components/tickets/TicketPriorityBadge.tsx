import { TicketPriority } from '@/lib/models/Ticket';

interface TicketPriorityBadgeProps {
    priority: TicketPriority;
}

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
    high: {
        label: 'High',
        className: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10',
    },
    medium: {
        label: 'Medium',
        className: 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20',
    },
    low: {
        label: 'Low',
        className: 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10',
    },
};

export default function TicketPriorityBadge({ priority }: TicketPriorityBadgeProps) {
    const config = priorityConfig[priority] || priorityConfig.medium;

    return (
        <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${config.className}`}
        >
            {config.label}
        </span>
    );
}
