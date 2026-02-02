/**
 * Notifications Page
 * 
 * Full page view for all notifications with filtering and mark-as-read.
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongoose';
import { Notification } from '@/lib/models';
import NotificationsPageClient from './NotificationsPageClient';

export const metadata = {
  title: 'Notifications | RoleReady',
  description: 'View and manage your notifications',
};

async function getNotifications(userId: string) {
  await connectDB();

  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const unreadCount = await Notification.countDocuments({ userId, isRead: false });

  return {
    notifications: notifications.map((n) => ({
      _id: n._id.toString(),
      type: n.type,
      title: n.title,
      message: n.message,
      actionUrl: n.actionUrl,
      isRead: n.isRead,
      metadata: n.metadata,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  };
}

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    redirect('/login');
  }

  const { notifications, unreadCount } = await getNotifications(userId);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Notifications
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Stay updated with your skill validations, readiness changes, and more.
        </p>
      </div>

      <NotificationsPageClient
        initialNotifications={notifications}
        initialUnreadCount={unreadCount}
      />
    </div>
  );
}
