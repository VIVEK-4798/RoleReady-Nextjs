/**
 * TicketMessage Model
 * 
 * Messages/replies in support tickets
 * Messages are NEVER deleted - audit trail forever
 */

import mongoose, { Schema, Model, Types } from 'mongoose';

export type MessageSenderRole = 'user' | 'mentor' | 'admin';

export interface ITicketMessage {
    _id: Types.ObjectId;
    ticketId: Types.ObjectId;
    senderId: Types.ObjectId;
    senderRole: MessageSenderRole;
    message: string;
    attachments?: string[];
    isInternal?: boolean; // Admin-only notes
    createdAt: Date;
    updatedAt: Date;
}

export interface ITicketMessageDocument extends ITicketMessage, mongoose.Document { }

export interface ITicketMessageModel extends Model<ITicketMessageDocument> { }

const TicketMessageSchema = new Schema<ITicketMessageDocument, ITicketMessageModel>(
    {
        ticketId: {
            type: Schema.Types.ObjectId,
            ref: 'Ticket',
            required: true,
            index: true,
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        senderRole: {
            type: String,
            enum: ['user', 'mentor', 'admin'],
            required: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
        },
        attachments: {
            type: [String],
            default: [],
        },
        isInternal: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        collection: 'ticketmessages',
    }
);

// Compound indexes for performance (single-field indexes already defined inline)
TicketMessageSchema.index({ ticketId: 1, createdAt: 1 });
TicketMessageSchema.index({ ticketId: 1, isInternal: 1 });

/**
 * Update ticket's lastMessageAt when message is created
 */
TicketMessageSchema.post('save', async function (doc) {
    try {
        const Ticket = mongoose.model('Ticket');
        await Ticket.findByIdAndUpdate(doc.ticketId, {
            lastMessageAt: doc.createdAt,
        });
    } catch (error) {
        console.error('Error updating ticket lastMessageAt:', error);
    }
});

// Prevent deletion
// Prevent deletion
TicketMessageSchema.pre('deleteOne', function (next: any) {
    next(new Error('Ticket messages cannot be deleted. Audit trail must be preserved.'));
});

TicketMessageSchema.pre('deleteMany', function (next: any) {
    next(new Error('Ticket messages cannot be deleted. Audit trail must be preserved.'));
});

const TicketMessage = (mongoose.models.TicketMessage as ITicketMessageModel) ||
    mongoose.model<ITicketMessageDocument, ITicketMessageModel>('TicketMessage', TicketMessageSchema);

export default TicketMessage;
