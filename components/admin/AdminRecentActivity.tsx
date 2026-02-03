/**
 * Admin Recent Activity Component
 * 
 * Displays recent activity or bookings section.
 * Migrated from old project's RecentBooking component.
 */

import Link from 'next/link';

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
}

interface AdminRecentActivityProps {
  title: string;
  viewAllHref?: string;
  activities: ActivityItem[];
  emptyMessage?: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminRecentActivity({ 
  title, 
  viewAllHref, 
  activities, 
  emptyMessage = 'No recent activity' 
}: AdminRecentActivityProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
        {viewAllHref && (
          <Link 
            href={viewAllHref} 
            className="text-sm text-[#5693C1] hover:underline font-medium"
          >
            View All
          </Link>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {activity.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs text-gray-400">
                  {activity.time}
                </span>
                {activity.status && (
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[activity.status]}`}>
                    {activity.status.replace('-', ' ')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
