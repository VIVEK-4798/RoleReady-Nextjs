/**
 * Ticket Model
 * 
 * Support ticket system for users, mentors, and admins
 * Tickets are NEVER deleted - audit trail forever
 */

import mongoose, { Schema, Model, Types } from 'mongoose';

export type TicketCategory = 'bug' | 'feature' | 'account' | 'payment' | 'other';
export type TicketPriority = 'low' | 'medium' | 'high';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
export type TicketRole = 'user' | 'mentor';

export interface ITicket {
    _id: Types.ObjectId;
    ticketNumber: string;
    createdBy: Types.ObjectId;
    role: TicketRole;
    subject: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    lastMessageAt: Date;
    assignedTo?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITicketDocument extends ITicket, mongoose.Document { }

export interface ITicketModel extends Model<ITicketDocument> {
    generateTicketNumber(): Promise<string>;
}

const TicketSchema = new Schema<ITicketDocument, ITicketModel>(
    {
        ticketNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        role: {
            type: String,
            enum: ['user', 'mentor'],
            required: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        category: {
            type: String,
            enum: ['bug', 'feature', 'account', 'payment', 'other'],
            required: true,
            default: 'other',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            required: true,
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['open', 'in_progress', 'waiting_user', 'resolved', 'closed'],
            required: true,
            default: 'open',
            index: true,
        },
        lastMessageAt: {
            type: Date,
            required: true,
            default: Date.now,
            index: true,
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
    },
    {
        timestamps: true,
        collection: 'tickets',
    }
);

// Compound indexes for performance (single-field indexes already defined inline)
TicketSchema.index({ createdBy: 1, status: 1 });
TicketSchema.index({ status: 1, lastMessageAt: -1 });
TicketSchema.index({ assignedTo: 1, status: 1 });

/**
 * Generate unique ticket number (e.g., RR-1024)
 */
TicketSchema.statics.generateTicketNumber = async function (): Promise<string> {
    const prefix = 'RR';

    // Find the highest ticket number
    const lastTicket = await this.findOne()
        .sort({ ticketNumber: -1 })
        .select('ticketNumber')
        .lean();

    let nextNumber = 1000; // Start from 1000

    if (lastTicket && lastTicket.ticketNumber) {
        const lastNumber = parseInt(lastTicket.ticketNumber.split('-')[1]);
        if (!isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
        }
    }

    return `${prefix}-${nextNumber}`;
};

/**
 * Pre-validate hook to generate ticket number
 * Using pre('validate') ensures the field is populated before required check
 */
TicketSchema.pre('validate', async function () {
    if (this.isNew && !this.ticketNumber) {
        this.ticketNumber = await (this.constructor as ITicketModel).generateTicketNumber();
    }
});

// Prevent deletion
TicketSchema.pre('deleteOne', function (next: any) {
    next(new Error('Tickets cannot be deleted. Audit trail must be preserved.'));
});

TicketSchema.pre('deleteMany', function (next: any) {
    next(new Error('Tickets cannot be deleted. Audit trail must be preserved.'));
});

const Ticket = (mongoose.models.Ticket as ITicketModel) ||
    mongoose.model<ITicketDocument, ITicketModel>('Ticket', TicketSchema);

export default Ticket;
