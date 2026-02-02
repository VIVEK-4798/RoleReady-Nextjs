/**
 * NotificationItem Component
 * 
 * Displays a single notification with type-specific styling and actions.
 */

'use client';

import Link from 'next/link';

// Simple time ago formatter (avoids date-fns dependency)
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

// Notification type from the model
type NotificationType = 'readiness_outdated' | 'mentor_validation' | 'roadmap_updated' | 'role_changed';

export interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
}

// Type-specific configuration
const typeConfig: Record<NotificationType, {
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  actionLabel: string;
  defaultUrl: string;
}> = {
  readiness_outdated: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    actionLabel: 'Recalculate Readiness',
    defaultUrl: '/dashboard/readiness',
  },
  mentor_validation: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    actionLabel: 'View Skills',
    defaultUrl: '/dashboard/skills',
  },
  roadmap_updated: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    actionLabel: 'View Roadmap',
    defaultUrl: '/dashboard/roadmap',
  },
  role_changed: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    actionLabel: 'View Target Role',
    defaultUrl: '/dashboard/target-role',
  },
};

export default function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const config = typeConfig[notification.type];
  const actionUrl = notification.actionUrl || config.defaultUrl;
  
  // Format time
  const timeAgo = formatTimeAgo(notification.createdAt);

  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification._id);
    }
  };

  return (
    <div 
      className={`
        flex items-start gap-4 p-4 border-b border-gray-200 dark:border-gray-700 
        transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 group
        ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
      `}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 p-2 rounded-full transition-transform duration-200 group-hover:scale-110 ${config.bgColor}`}>
        <span className={config.iconColor}>{config.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
              {notification.title}
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {notification.message}
            </p>
          </div>
          
          {/* Unread indicator */}
          {!notification.isRead && (
            <span className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full" />
          )}
        </div>

        {/* Footer */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {timeAgo}
          </span>
          
          <Link
            href={actionUrl}
            onClick={handleClick}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            {config.actionLabel} →
          </Link>
        </div>
      </div>
    </div>
  );
}
