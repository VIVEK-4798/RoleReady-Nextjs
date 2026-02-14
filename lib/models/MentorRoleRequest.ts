import mongoose, { Schema, Document, Model } from 'mongoose';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface IMentorRoleRequest extends Document {
    userId: mongoose.Types.ObjectId;
    status: RequestStatus;
    requestedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: mongoose.Types.ObjectId;
    rejectionReason?: string;
    snapshotOfUserData?: any;
    createdAt: Date;
    updatedAt: Date;
}

const MentorRoleRequestSchema = new Schema<IMentorRoleRequest>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
            index: true,
        },
        requestedAt: {
            type: Date,
            default: Date.now,
        },
        reviewedAt: {
            type: Date,
        },
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        rejectionReason: {
            type: String,
        },
        snapshotOfUserData: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

// Only one active pending request per user
MentorRoleRequestSchema.index(
    { userId: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'pending' } }
);

const MentorRoleRequest: Model<IMentorRoleRequest> =
    mongoose.models.MentorRoleRequest ||
    mongoose.model<IMentorRoleRequest>('MentorRoleRequest', MentorRoleRequestSchema);

export default MentorRoleRequest;
