/**
 * Notifications Page Client Component
 * 
 * Handles client-side state and interactions for notifications.
 */

'use client';

import { NotificationsList, Notification } from '@/components/notifications';

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
    <NotificationsList
      initialNotifications={initialNotifications}
      initialUnreadCount={initialUnreadCount}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
    />
  );
}
