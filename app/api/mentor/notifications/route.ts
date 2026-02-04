/**
 * Mentor Notifications API
 * 
 * GET /api/mentor/notifications - Get notifications relevant to mentor activities
 * 
 * Mentors see notifications about:
 * - Skills they have validated (mentor_validation type)
 * - Validation requests assigned to them
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Notification, UserSkill } from '@/lib/models';
import { requireMentorApi } from '@/lib/auth/utils';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireMentorApi();
    if (error) return error;
    if (!user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const filter = searchParams.get('filter') || 'all'; // all, unread

    const skip = (page - 1) * limit;

    // For mentors, we show:
    // 1. Their own notifications (if they are also users)
    // 2. Validation activity notifications (skills they validated)
    
    // Get skills that this mentor has validated
    const validatedSkillIds = await UserSkill.find({
      validatedBy: new Types.ObjectId(user.id),
    }).distinct('_id');

    // Build query for notifications
    // Mentors see notifications related to skills they validated
    const query: Record<string, unknown> = {
      $or: [
        { userId: new Types.ObjectId(user.id) }, // Their own notifications
        { 
          'metadata.userSkillId': { $in: validatedSkillIds.map(id => id.toString()) },
          type: 'mentor_validation'
        }
      ]
    };

    if (filter === 'unread') {
      query.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName email'),
      Notification.countDocuments(query),
    ]);

    // Also get count of unread for mentor's own notifications
    const unreadCount = await Notification.countDocuments({
      userId: new Types.ObjectId(user.id),
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching mentor notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, error } = await requireMentorApi();
    if (error) return error;
    if (!user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { action, notificationIds } = body;

    if (action === 'mark-read') {
      const query: Record<string, unknown> = {
        userId: new Types.ObjectId(user.id),
      };

      if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
        query._id = { $in: notificationIds.map((id: string) => new Types.ObjectId(id)) };
      }

      const result = await Notification.updateMany(query, { isRead: true });

      return NextResponse.json({
        success: true,
        message: `Marked ${result.modifiedCount} notification(s) as read`,
      });
    }

    if (action === 'mark-all-read') {
      const result = await Notification.updateMany(
        { userId: new Types.ObjectId(user.id), isRead: false },
        { isRead: true }
      );

      return NextResponse.json({
        success: true,
        message: `Marked ${result.modifiedCount} notification(s) as read`,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
