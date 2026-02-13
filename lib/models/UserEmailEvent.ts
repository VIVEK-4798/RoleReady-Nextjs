/**
 * User Email Event Model
 * 
 * Tracks all lifecycle emails sent to users to prevent duplicates
 * and maintain email history.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserEmailEvent {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    event: string;
    metadata?: Record<string, unknown>;
    sentAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserEmailEventDocument extends Omit<IUserEmailEvent, '_id'>, Document { }

const UserEmailEventSchema = new Schema<IUserEmailEventDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        event: {
            type: String,
            required: true,
            index: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        sentAt: {
            type: Date,
            required: true,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound unique index to prevent duplicate single-fire events
// For events that should only be sent once per user
UserEmailEventSchema.index({ userId: 1, event: 1 }, { unique: true });

// Index for querying user's email history
UserEmailEventSchema.index({ userId: 1, sentAt: -1 });

// Index for admin analytics
UserEmailEventSchema.index({ event: 1, sentAt: -1 });

export const UserEmailEvent: Model<IUserEmailEventDocument> =
    mongoose.models.UserEmailEvent ||
    mongoose.model<IUserEmailEventDocument>('UserEmailEvent', UserEmailEventSchema);
