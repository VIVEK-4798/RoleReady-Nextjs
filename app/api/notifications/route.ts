/**
 * Notifications API Routes
 * 
 * GET /api/notifications - Get user's notifications
 * PATCH /api/notifications - Mark notifications as read
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Notification } from '@/lib/models';
import { successResponse, paginatedResponse, errors } from '@/lib/utils/api';
import { requireAuthApi } from '@/lib/auth/utils';
import { parsePaginationParams, createPagination } from '@/lib/utils/db';

/**
 * GET /api/notifications
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - filter: 'all' | 'unread' (default: 'all')
 * - type: Filter by notification type (optional)
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const { user, error } = await requireAuthApi();
    if (error) return error;
    if (!user?.id) return errors.unauthorized('Authentication required');

    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePaginationParams(searchParams, { page: 1, limit: 20 });
    const filter = searchParams.get('filter') || 'all';
    const type = searchParams.get('type');

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { userId: user.id };

    if (filter === 'unread') {
      query.isRead = false;
    }

    if (type) {
      query.type = type;
    }

    // Execute query with pagination
    const [notifications, totalItems, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate('userId', 'firstName lastName email profileImage')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId: user.id, isRead: false }),
    ]);

    const pagination = createPagination(page, limit, totalItems);

    return paginatedResponse(
      notifications.map((n: any) => ({
        _id: n._id,
        userId: n.userId, // This is now populated
        type: n.type,
        title: n.title,
        message: n.message,
        actionUrl: n.actionUrl,
        isRead: n.isRead,
        metadata: n.metadata,
        createdAt: n.createdAt,
      })),
      pagination,
      `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
    );
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return errors.serverError('Failed to fetch notifications');
  }
}

/**
 * PATCH /api/notifications
 * 
 * Mark notifications as read
 * 
 * Body:
 * - notificationIds: Array of notification IDs to mark as read (optional - if empty, marks all)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Require authentication
    const { user, error } = await requireAuthApi();
    if (error) return error;
    if (!user?.id) return errors.unauthorized('Authentication required');

    await connectDB();

    let notificationIds: string[] | undefined;

    try {
      const body = await request.json();
      notificationIds = body.notificationIds;
    } catch {
      // Empty body means mark all as read
      notificationIds = undefined;
    }

    // Use the static method on Notification model
    const modifiedCount = await Notification.markAsRead(user.id, notificationIds);

    return successResponse(
      {
        markedAsRead: modifiedCount,
        message: notificationIds
          ? `Marked ${modifiedCount} notification(s) as read`
          : 'Marked all notifications as read'
      },
      'Notifications updated'
    );
  } catch (error) {
    console.error('PATCH /api/notifications error:', error);
    return errors.serverError('Failed to update notifications');
  }
}
