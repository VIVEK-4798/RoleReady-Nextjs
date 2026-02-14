/**
 * Mentor Notifications Client Component
 * 
 * Display and manage mentor notifications with read/unread status.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface NotificationUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

interface Notification {
  _id: string;
  userId: NotificationUser;
  type: 'skill_validation' | 'student_message' | 'system_alert' | 'opportunity_match' | 'announcement';
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

interface Stats {
  unread: number;
  total: number;
  today: number;
  highPriority: number;
}

export default function MentorNotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<Stats>({
    unread: 0,
    total: 0,
    today: 0,
    highPriority: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'high' | 'today'>('all');
  const [showActions, setShowActions] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/notifications?limit=100'); // Fetch enough for stats
      if (!res.ok) throw new Error('Failed to fetch notifications');

      const result = await res.json();
      const allNotifications = result.data || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayCount = allNotifications.filter((n: any) =>
        new Date(n.createdAt) >= today
      ).length;

      const unreadCount = allNotifications.filter((n: any) => !n.isRead).length;
      const highPriorityCount = allNotifications.filter((n: any) => n.priority === 'high' || n.metadata?.priority === 'high').length;

      setStats({
        unread: unreadCount,
        total: result.pagination?.totalItems || allNotifications.length,
        today: todayCount,
        highPriority: highPriorityCount,
      });

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter((notification) => {
    if (selectedFilter === 'unread') return !notification.isRead;
    if (selectedFilter === 'high') return notification.priority === 'high' || notification.metadata?.priority === 'high';
    if (selectedFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(notification.createdAt) >= today;
    }
    return true;
  });

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] })
      });

      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );
        setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      });

      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
        setStats(prev => ({ ...prev, unread: 0 }));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        const deletedNotification = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(n => n._id !== notificationId));

        if (deletedNotification && !deletedNotification.isRead) {
          setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
        }
        setStats(prev => ({ ...prev, total: prev.total - 1 }));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, { icon: React.ReactNode; color: string }> = {
      validation_request: {
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        ),
        color: 'text-indigo-600 bg-indigo-100',
      },
      mentor_validation: {
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'text-green-600 bg-green-100',
      },
      system_alert: {
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'text-yellow-600 bg-yellow-100',
      },
    };

    return icons[type] || icons.system_alert;
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      high: 'bg-red-100 text-red-700 border border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      low: 'bg-gray-100 text-gray-600 border border-gray-200',
    };
    const p = priority || 'low';
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[p] || styles.low}`}>
        {p.charAt(0).toUpperCase() + p.slice(1)}
      </span>
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">🔔 Notifications</h1>
          <p className="mt-2 text-gray-600">
            Stay updated with student activities, system alerts, and important announcements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllAsRead}
            disabled={stats.unread === 0}
            className="px-4 py-2.5 border border-[#5693C1] text-[#5693C1] hover:bg-[#5693C1] hover:text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.unread}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Messages awaiting your attention
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Notifications</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            All notifications in your inbox
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.today}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Notifications received today
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.highPriority}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Urgent notifications requiring action
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Filter Notifications</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all' as const, label: 'All', count: stats.total },
                { key: 'unread' as const, label: 'Unread', count: stats.unread },
                { key: 'high' as const, label: 'High Priority', count: stats.highPriority },
                { key: 'today' as const, label: 'Today', count: stats.today },
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setSelectedFilter(filterOption.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${selectedFilter === filterOption.key
                    ? 'bg-[#5693C1] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {filterOption.label}
                  {filterOption.count > 0 && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${selectedFilter === filterOption.key
                      ? 'bg-white/30'
                      : 'bg-gray-200'
                      }`}>
                      {filterOption.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search notifications..."
                className="w-full sm:w-64 px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent"
                style={{ color: '#000000' }}
              />
              <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#5693C1]/10 mb-4">
              <svg className="w-6 h-6 text-[#5693C1] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-gray-600">Loading your notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600">
              {selectedFilter === 'all'
                ? 'You\'re all caught up! No notifications in your inbox.'
                : `No ${selectedFilter} notifications found.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => {
              const iconConfig = getNotificationIcon(notification.type);

              return (
                <div
                  key={notification._id}
                  className={`p-5 hover:bg-gray-50 transition-colors relative ${!notification.isRead ? 'bg-blue-50/30 border-l-4 border-[#5693C1]' : ''
                    }`}
                  onMouseEnter={() => setShowActions(notification._id)}
                  onMouseLeave={() => setShowActions(null)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${iconConfig.color}`}>
                      {iconConfig.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                            {getPriorityBadge(notification.priority)}
                            {!notification.isRead && (
                              <span className="inline-flex w-2 h-2 rounded-full bg-[#5693C1]"></span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-2">
                              {notification.userId._id !== 'system' && (
                                <>
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#5693C1] to-[#4a80b0] flex items-center justify-center text-white text-xs">
                                    {getInitials(notification.userId.firstName, notification.userId.lastName)}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {notification.userId.firstName} {notification.userId.lastName}
                                  </span>
                                </>
                              )}
                              <span className="text-xs text-gray-400">•</span>
                            </div>
                            <span className="text-xs text-gray-400">{formatTimeAgo(notification.createdAt)}</span>
                          </div>
                        </div>

                        {/* Action Buttons (Hover) */}
                        <div className={`flex items-center gap-2 transition-opacity ${showActions === notification._id ? 'opacity-100' : 'opacity-0'
                          }`}>
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              title="Mark as read"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification._id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                            title="Delete notification"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-3">{notification.message}</p>

                      <div className="flex items-center gap-3">
                        {notification.actionUrl && (
                          <Link
                            href={notification.actionUrl}
                            className="text-sm text-[#5693C1] hover:text-[#4a80b0] font-medium inline-flex items-center gap-1"
                          >
                            View Details
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </Link>
                        )}

                        <span className={`text-xs px-2 py-1 rounded ${notification.type === 'skill_validation' ? 'bg-green-50 text-green-700' :
                          notification.type === 'student_message' ? 'bg-blue-50 text-blue-700' :
                            notification.type === 'opportunity_match' ? 'bg-purple-50 text-purple-700' :
                              notification.type === 'announcement' ? 'bg-red-50 text-red-700' :
                                'bg-gray-50 text-gray-700'
                          }`}>
                          {notification.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-r from-[#5693C1]/5 to-[#4a80b0]/5 border border-[#5693C1]/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#5693C1] flex items-center justify-center text-white flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Notification Management Tips</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <span className="font-medium">High priority notifications</span> require immediate attention</li>
              <li>• Review <span className="font-medium">unread notifications</span> daily to stay updated</li>
              <li>• Use filters to organize notifications by type or priority</li>
              <li>• Mark notifications as read to keep your inbox clean</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}