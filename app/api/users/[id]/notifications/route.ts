/**
 * User Notifications API Routes
 * 
 * GET /api/users/[id]/notifications - Get notifications
 * PATCH /api/users/[id]/notifications - Mark notifications as read
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Notification } from '@/lib/models';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id]/notifications
 * Get notifications for a user
 * 
 * Query params:
 * - unreadOnly: boolean (default true) - Only return unread notifications
 * - limit: number (default 10) - Max items to return
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only access your own notifications');
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') !== 'false';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    await connectDB();

    const query: Record<string, unknown> = { userId: id };
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 50))
      .exec();

    const unreadCount = await Notification.getUnreadCount(id);

    return success({
      notifications: notifications.map((n) => ({
        id: n._id,
        type: n.type,
        title: n.title,
        message: n.message,
        actionUrl: n.actionUrl,
        isRead: n.isRead,
        metadata: n.metadata,
        createdAt: n.createdAt,
      })),
      unreadCount,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/users/[id]/notifications
 * Mark notifications as read
 * 
 * Body:
 * - notificationIds?: string[] - Specific notification IDs to mark as read
 *   If not provided, marks ALL unread notifications as read
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only update your own notifications');
    }

    const body = await request.json();

    await connectDB();

    const markedCount = await Notification.markAsRead(id, body.notificationIds);

    return success({
      markedAsRead: markedCount,
      message: markedCount > 0 
        ? `Marked ${markedCount} notification(s) as read`
        : 'No notifications to mark as read',
    });
  } catch (error) {
    return handleError(error);
  }
}
