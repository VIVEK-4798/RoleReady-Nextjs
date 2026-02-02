/**
 * Notifications Count API
 * 
 * GET /api/notifications/count - Get unread notification count
 */

import connectDB from '@/lib/db/mongoose';
import { Notification } from '@/lib/models';
import { successResponse, errors } from '@/lib/utils/api';
import { requireAuthApi } from '@/lib/auth/utils';

/**
 * GET /api/notifications/count
 * 
 * Returns the count of unread notifications for the authenticated user.
 * Useful for notification badge in header.
 */
export async function GET() {
  try {
    // Require authentication
    const { user, error } = await requireAuthApi();
    if (error) return error;
    if (!user?.id) return errors.unauthorized('Authentication required');

    await connectDB();

    const unreadCount = await Notification.getUnreadCount(user.id);

    return successResponse({
      unreadCount,
      hasUnread: unreadCount > 0,
    });
  } catch (error) {
    console.error('GET /api/notifications/count error:', error);
    return errors.serverError('Failed to fetch notification count');
  }
}
