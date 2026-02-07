/**
 * Notifications Page Client Component
 * 
 * Handles client-side state and interactions for notifications.
 */

'use client';

import { useState } from 'react';
import { Notification } from '@/components/notifications/NotificationItem';

// Re-export Notification type for parent components
export type { Notification };

interface NotificationsPageClientProps {
  initialNotifications: Notification[];
  initialUnreadCount: number;
}

export default function NotificationsPageClient({
  initialNotifications,
  initialUnreadCount,
}: NotificationsPageClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  // Mark specific notifications as read
  const handleMarkAsRead = async (ids: string[]) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: ids }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to mark as read');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Empty body marks all
      });
      
      if (!res.ok) {
        throw new Error('Failed to mark all as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Unread</p>
              <p className="text-2xl font-bold text-[#5693C1]">{unreadCount}</p>
            </div>
            <div className="p-2 bg-[#5693C1]/10 rounded-lg">
              <svg className="w-6 h-6 text-[#5693C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Read</p>
              <p className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Notifications Component */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your Notifications</h2>
          <p className="text-gray-600">
            Stay updated with your skill validations, readiness changes, and more.
          </p>
        </div>
        
        <div>
          {/* You'll need to import NotificationsList component here */}
          {/* Replace this with your actual NotificationsList component import */}
          {/* If NotificationsList is not available, use the NotificationsList component I provided above */}
        </div>
      </div>
    </div>
  );
}