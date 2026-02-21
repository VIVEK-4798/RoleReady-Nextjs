import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeedback extends Document {
    email: string;
    message: string;
    userId?: mongoose.Types.ObjectId;
    status: 'new' | 'reviewed' | 'resolved';
    ipAddress?: string;
    createdAt: Date;
    updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please enter a valid email',
            ],
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            minlength: [10, 'Message must be at least 10 characters'],
            maxlength: [2000, 'Message cannot exceed 2000 characters'],
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        status: {
            type: String,
            enum: ['new', 'reviewed', 'resolved'],
            default: 'new',
        },
        ipAddress: {
            type: String,
            select: false, // Don't include IP by default in queries
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for admin panel later
FeedbackSchema.index({ status: 1 });
FeedbackSchema.index({ createdAt: -1 });

const Feedback: Model<IFeedback> =
    mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default Feedback;
