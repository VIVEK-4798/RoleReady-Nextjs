/**
 * Notification Service
 * 
 * Centralized service for sending system notifications.
 * Uses the Notification model to store notifications for users.
 */

import { Types } from 'mongoose';
import dbConnect from '@/lib/db/mongoose';
import Notification, { NotificationType } from '@/lib/models/Notification';

interface NotificationData {
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Send a notification to a single user
 */
export async function sendNotification(
    userId: string | Types.ObjectId,
    type: NotificationType,
    data: NotificationData
) {
    try {
        await dbConnect();
        await Notification.create({
            userId,
            type,
            ...data
        });
        return true;
    } catch (error) {
        console.error('Error sending notification:', error);
        return false;
    }
}

/**
 * Send notifications to multiple users
 */
export async function sendNotifications(
    userIds: (string | Types.ObjectId)[],
    type: NotificationType,
    data: NotificationData
) {
    try {
        await dbConnect();
        const notifications = userIds.map(userId => ({
            userId,
            type,
            ...data
        }));

        await Notification.insertMany(notifications);
        return true;
    } catch (error) {
        console.error('Error sending notifications:', error);
        return false;
    }
}

/**
 * Create or update a notification (deduplication)
 */
export async function createOrUpdateNotification(
    userId: string | Types.ObjectId,
    type: NotificationType,
    data: NotificationData
) {
    try {
        await dbConnect();
        // @ts-ignore - Static method added to schema
        return await Notification.createOrUpdate(userId, type, data);
    } catch (error) {
        console.error('Error creating/updating notification:', error);
        return null;
    }
}
