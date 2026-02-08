/**
 * NotificationItem Component
 * 
 * Displays a single notification with type-specific styling and actions.
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';

// Simple time ago formatter
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
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
  label: string;
  defaultUrl: string;
}> = {
  readiness_outdated: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    label: 'Readiness',
    defaultUrl: '/readiness',
  },
  mentor_validation: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    label: 'Validation',
    defaultUrl: '/dashboard/skills',
  },
  roadmap_updated: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    ),
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    label: 'Roadmap',
    defaultUrl: '/roadmap',
  },
  role_changed: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    label: 'Role',
    defaultUrl: '/dashboard/roles',
  },
};

export default function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const [isMarking, setIsMarking] = useState(false);
  const config = typeConfig[notification.type];
  const actionUrl = notification.actionUrl || config.defaultUrl;
  
  // Format time
  const timeAgo = formatTimeAgo(notification.createdAt);

  const handleMarkAsReadClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (notification.isRead || !onMarkAsRead) return;
    
    setIsMarking(true);
    try {
      await onMarkAsRead(notification._id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div 
      className={`
        px-6 py-4 transition-colors
        ${!notification.isRead ? 'bg-blue-50' : ''}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${config.bgColor}`}>
          <span className={config.iconColor}>{config.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${config.bgColor} ${config.iconColor}`}>
                  {config.label}
                </span>
                {!notification.isRead && (
                  <span className="text-xs px-2 py-0.5 bg-[#5693C1] text-white rounded">
                    New
                  </span>
                )}
              </div>
              
              <h4 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                {notification.title}
              </h4>
              
              <p className="mt-1 text-sm text-gray-600">
                {notification.message}
              </p>
            </div>
            
            {/* Mark as read button */}
            {!notification.isRead && onMarkAsRead && (
              <button
                onClick={handleMarkAsReadClick}
                disabled={isMarking}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Mark as read"
                aria-label="Mark as read"
              >
                {isMarking ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#5693C1" strokeWidth="4" />
                    <path className="opacity-75" fill="#5693C1" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {timeAgo}
            </span>
            
            {actionUrl && (
              <Link
                href={actionUrl}
                className="text-sm font-medium text-[#5693C1] hover:text-[#4a82b0] inline-flex items-center gap-1"
              >
                View details
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}