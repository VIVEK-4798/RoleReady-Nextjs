/**
 * NotificationsList Component
 * 
 * Displays a list of notifications with filtering and mark-as-read functionality.
 */

'use client';

import { useState, useCallback } from 'react';
import NotificationItem, { Notification } from './NotificationItem';

interface NotificationsListProps {
  initialNotifications: Notification[];
  initialUnreadCount: number;
  onMarkAsRead?: (ids: string[]) => Promise<void>;
  onMarkAllAsRead?: () => Promise<void>;
}

type FilterType = 'all' | 'unread';

export default function NotificationsList({
  initialNotifications,
  initialUnreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsListProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // Filter notifications
  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  // Handle marking single notification as read
  const handleMarkAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // Call API
    if (onMarkAsRead) {
      try {
        await onMarkAsRead([id]);
      } catch (error) {
        // Revert on error
        console.error('Failed to mark as read:', error);
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: false } : n))
        );
        setUnreadCount((prev) => prev + 1);
      }
    }
  }, [onMarkAsRead]);

  // Handle marking all as read
  const handleMarkAllAsRead = useCallback(async () => {
    if (unreadCount === 0) return;
    
    setIsMarkingAll(true);
    
    // Optimistic update
    const previousNotifications = [...notifications];
    const previousCount = unreadCount;
    
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    if (onMarkAllAsRead) {
      try {
        await onMarkAllAsRead();
      } catch (error) {
        // Revert on error
        console.error('Failed to mark all as read:', error);
        setNotifications(previousNotifications);
        setUnreadCount(previousCount);
      }
    }
    
    setIsMarkingAll(false);
  }, [notifications, unreadCount, onMarkAllAsRead]);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
              className="px-4 py-2 bg-[#5693C1] hover:bg-[#4a82b0] text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm inline-flex items-center gap-2 self-start"
            >
              {isMarkingAll ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Marking all...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mark all as read
                </>
              )}
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              filter === 'all'
                ? 'bg-[#5693C1] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              filter === 'unread'
                ? 'bg-[#5693C1] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div>
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div key={notification._id} className="hover:bg-gray-50 transition-colors">
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gray-100 mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <p className="text-gray-900 font-medium mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-gray-600 text-sm">
              {filter === 'unread'
                ? "You're all caught up!"
                : 'Notifications will appear here when you have updates'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </p>
            <p className="text-sm font-medium text-[#5693C1]">
              {unreadCount} unread
            </p>
          </div>
        </div>
      )}
    </div>
  );
}