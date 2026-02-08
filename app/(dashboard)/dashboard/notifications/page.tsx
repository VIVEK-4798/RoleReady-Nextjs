/**
 * Notifications Page
 * 
 * Full page view for all notifications with filtering and mark-as-read.
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongoose';
import { Notification, NotificationType } from '@/lib/models';
import NotificationsPageClient from './NotificationsPageClient';

export const metadata = {
  title: 'Notifications | RoleReady',
  description: 'View and manage your notifications',
};

// Helper to serialize metadata and convert ObjectIds to strings
function serializeMetadata(metadata: any): Record<string, any> {
  if (!metadata || typeof metadata !== 'object') return metadata;
  
  const serialized: Record<string, any> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value && typeof value === 'object') {
      // Check if it's an ObjectId (has _id or buffer property)
      if ('_id' in value || 'buffer' in value) {
        serialized[key] = value.toString();
      } else if (Array.isArray(value)) {
        serialized[key] = value.map(item => 
          item && typeof item === 'object' ? serializeMetadata(item) : item
        );
      } else {
        serialized[key] = serializeMetadata(value);
      }
    } else {
      serialized[key] = value;
    }
  }
  return serialized;
}

async function getNotifications(userId: string) {
  await connectDB();

  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const unreadCount = await Notification.countDocuments({ 
    userId, 
    isRead: false 
  });

  return {
    notifications: notifications.map((n) => ({
      _id: n._id.toString(),
      type: n.type as NotificationType,
      title: n.title,
      message: n.message,
      actionUrl: n.actionUrl,
      isRead: n.isRead,
      metadata: serializeMetadata(n.metadata),
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  };
}

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?redirect=/notifications');
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    redirect('/login?redirect=/notifications');
  }

  const { notifications, unreadCount } = await getNotifications(userId);

  return (
    <>
      <div className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto">
          <NotificationsPageClient
            initialNotifications={notifications}
            initialUnreadCount={unreadCount}
          />
        </div>
      </div>
    </>
  );
}