/**
 * Notifications Page Client Component
 * 
 * Handles client-side state and interactions for notifications.
 */

'use client';

import { useState } from 'react';
import NotificationItem, { Notification } from '@/components/notifications/NotificationItem';

// Re-export Notification type for parent components
export type { Notification };

interface NotificationsPageClientProps {
  initialNotifications: Notification[];
  initialUnreadCount: number;
}

type TabType = 'unread' | 'all';

export default function NotificationsPageClient({
  initialNotifications,
  initialUnreadCount,
}: NotificationsPageClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [activeTab, setActiveTab] = useState<TabType>('unread');
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

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

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n._id) ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - ids.length));
    } catch (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  };

  // Mark single notification as read
  const handleMarkSingleAsRead = async (id: string) => {
    await handleMarkAsRead([id]);
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    try {
      setIsMarkingAllAsRead(true);
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to mark all as read');
      }

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      setActiveTab('all'); // Switch to all tab
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setIsMarkingAllAsRead(false);
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    
    try {
      setIsClearingAll(true);
      const res = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!res.ok) {
        throw new Error('Failed to clear all notifications');
      }

      // Update local state
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    } finally {
      setIsClearingAll(false);
    }
  };

  // Filter notifications based on active tab
  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  // Get notification type count
  const notificationTypes = {
    outdated: notifications.filter(n => n.type === 'readiness_outdated').length,
    validation: notifications.filter(n => n.type === 'mentor_validation').length,
    roadmap: notifications.filter(n => n.type === 'roadmap_updated').length,
    roleChanged: notifications.filter(n => n.type === 'role_changed').length,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-2">Stay updated with your progress and activities</p>
            </div>
            
            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAllAsRead}
                  className="px-4 py-2 bg-[#5693C1] hover:bg-[#4a82b0] text-white rounded-lg font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {isMarkingAllAsRead ? 'Marking...' : 'Mark all as read'}
                </button>
              )}
              
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  disabled={isClearingAll}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {isClearingAll ? 'Clearing...' : 'Clear all'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-2xl font-bold text-gray-900">{notifications.length}</div>
              </div>
              <div className="text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Unread</div>
                <div className="text-2xl font-bold text-[#5693C1]">{unreadCount}</div>
              </div>
              <div className="text-[#5693C1]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" strokeWidth="2" fill="#5693C1"/>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Validations</div>
                <div className="text-2xl font-bold text-emerald-600">{notificationTypes.validation}</div>
              </div>
              <div className="text-emerald-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Roadmaps</div>
                <div className="text-2xl font-bold text-blue-600">{notificationTypes.roadmap}</div>
              </div>
              <div className="text-blue-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('unread')}
                className={`
                  py-3 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'unread'
                    ? 'border-[#5693C1] text-[#5693C1]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Unread
                {unreadCount > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'unread' ? 'bg-[#5693C1] text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('all')}
                className={`
                  py-3 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'all'
                    ? 'border-[#5693C1] text-[#5693C1]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                All Notifications
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'all' ? 'bg-[#5693C1] text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {notifications.length}
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl border border-gray-200">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div key={notification._id} className="hover:bg-gray-50 transition-colors">
                  <div className="px-6 py-4">
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={handleMarkSingleAsRead}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {activeTab === 'unread' 
                  ? "You're all caught up! Check back later for new updates."
                  : "When you receive notifications about your skills, readiness, or validations, they'll appear here."
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {activeTab === 'unread' ? (
                  <button
                    onClick={() => setActiveTab('all')}
                    className="px-4 py-2 bg-[#5693C1] hover:bg-[#4a82b0] text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    View all notifications
                  </button>
                ) : (
                  <>
                    <a
                      href="/dashboard"
                      className="px-4 py-2 bg-[#5693C1] hover:bg-[#4a82b0] text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      Go to Dashboard
                    </a>
                    <a
                      href="/readiness"
                      className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors text-sm"
                    >
                      Check Readiness
                    </a>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {notifications.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Showing {filteredNotifications.length} of {notifications.length} notifications
              {activeTab === 'unread' && ` (${unreadCount} unread)`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}