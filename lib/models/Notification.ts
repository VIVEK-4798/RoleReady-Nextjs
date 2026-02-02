/**
 * Notification Model
 * 
 * System-generated notifications to guide users through their readiness journey.
 * 
 * Design Decisions:
 * 
 * 1. FIXED TYPE LIST: Only 4 notification types are supported:
 *    - readiness_outdated: Profile/skills changed, needs recalculation
 *    - mentor_validation: Skills validated/rejected by mentor
 *    - roadmap_updated: New roadmap saved after readiness calc
 *    - role_changed: Target role switched
 * 
 * 2. NEVER USER-CREATED: Notifications are always system-generated
 *    from specific events. Users can only read/dismiss them.
 * 
 * 3. DEDUPLICATION: Only one unread notification of a type per user.
 *    If a new event triggers the same type, we update the existing one.
 * 
 * 4. ACTIONABLE: Every notification has an action_url pointing to
 *    where the user should go to resolve it.
 */

import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ============================================================================
// Types
// ============================================================================

export type NotificationType = 
  | 'readiness_outdated'
  | 'mentor_validation'
  | 'roadmap_updated'
  | 'role_changed';

export interface INotification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  metadata?: Record<string, unknown>; // Extra context (e.g., roleId, mentorId)
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Document Interface
// ============================================================================

export interface INotificationDocument extends Omit<INotification, '_id'>, Document {}

// ============================================================================
// Model Interface with Static Methods
// ============================================================================

interface INotificationModel extends Model<INotificationDocument> {
  /**
   * Create or update a notification (upsert by type for deduplication)
   * If an unread notification of the same type exists, update it
   */
  createOrUpdate(
    userId: string | Types.ObjectId,
    type: NotificationType,
    data: {
      title: string;
      message: string;
      actionUrl?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<INotificationDocument>;
  
  /**
   * Get unread notifications for a user
   */
  getUnreadForUser(
    userId: string | Types.ObjectId,
    options?: { limit?: number }
  ): Promise<INotificationDocument[]>;
  
  /**
   * Get unread count for a user
   */
  getUnreadCount(userId: string | Types.ObjectId): Promise<number>;
  
  /**
   * Mark notification(s) as read
   */
  markAsRead(
    userId: string | Types.ObjectId,
    notificationIds?: (string | Types.ObjectId)[]
  ): Promise<number>;
}

// ============================================================================
// Schema
// ============================================================================

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ['readiness_outdated', 'mentor_validation', 'roadmap_updated', 'role_changed'] as NotificationType[],
        message: '{VALUE} is not a valid notification type',
      },
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [255, 'Title cannot exceed 255 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    actionUrl: {
      type: String,
      maxlength: [500, 'Action URL cannot exceed 500 characters'],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================================
// Indexes
// ============================================================================

// Efficient unread notification queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Deduplication: find existing unread notification by type
NotificationSchema.index({ userId: 1, type: 1, isRead: 1 });

// ============================================================================
// Static Methods
// ============================================================================

NotificationSchema.statics.createOrUpdate = async function (
  userId: string | Types.ObjectId,
  type: NotificationType,
  data: {
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<INotificationDocument> {
  // Find existing unread notification of same type
  const existing = await this.findOne({
    userId,
    type,
    isRead: false,
  });

  if (existing) {
    // Update existing notification
    existing.title = data.title;
    existing.message = data.message;
    existing.actionUrl = data.actionUrl;
    existing.metadata = data.metadata;
    await existing.save();
    return existing;
  }

  // Create new notification
  return this.create({
    userId,
    type,
    title: data.title,
    message: data.message,
    actionUrl: data.actionUrl,
    metadata: data.metadata,
  });
};

NotificationSchema.statics.getUnreadForUser = async function (
  userId: string | Types.ObjectId,
  options?: { limit?: number }
): Promise<INotificationDocument[]> {
  let query = this.find({
    userId,
    isRead: false,
  }).sort({ createdAt: -1 });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  return query.exec();
};

NotificationSchema.statics.getUnreadCount = async function (
  userId: string | Types.ObjectId
): Promise<number> {
  return this.countDocuments({
    userId,
    isRead: false,
  });
};

NotificationSchema.statics.markAsRead = async function (
  userId: string | Types.ObjectId,
  notificationIds?: (string | Types.ObjectId)[]
): Promise<number> {
  const query: Record<string, unknown> = { userId, isRead: false };
  
  if (notificationIds && notificationIds.length > 0) {
    query._id = { $in: notificationIds };
  }

  const result = await this.updateMany(query, { isRead: true });
  return result.modifiedCount;
};

// ============================================================================
// Export
// ============================================================================

const Notification = (mongoose.models.Notification as INotificationModel) ||
  mongoose.model<INotificationDocument, INotificationModel>('Notification', NotificationSchema);

export default Notification;
