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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50"
            >
              {isMarkingAll ? 'Marking...' : 'Mark all as read'}
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => setFilter('all')}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              filter === 'all'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              filter === 'unread'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))
        ) : (
          <div className="p-8 text-center">
            <svg
              className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500"
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
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {filter === 'unread'
                ? 'No unread notifications'
                : 'No notifications yet'}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
              {filter === 'unread'
                ? 'You\'re all caught up!'
                : 'Notifications will appear here when you have updates'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
