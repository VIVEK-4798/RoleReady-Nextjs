import connectDB from '@/lib/db/mongoose';
import Feedback from '@/lib/models/Feedback';
import mongoose from 'mongoose';

interface GetFeedbackParams {
    page: number;
    limit: number;
    type?: string;
    status?: string;
    search?: string;
}

export const feedbackService = {
    /**
     * Get a paginated list of feedback with filters
     */
    async getFeedbackList({ page, limit, type, status, search }: GetFeedbackParams) {
        await connectDB();

        const query: mongoose.FilterQuery<any> = {};

        if (type && type !== 'all') {
            query.type = type;
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;

        const [feedbacks, total] = await Promise.all([
            Feedback.find(query)
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Feedback.countDocuments(query),
        ]);

        return {
            feedbacks,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    /**
     * Update the status of a feedback entry
     */
    async updateFeedbackStatus(feedbackId: string, status: string) {
        await connectDB();

        const feedback = await Feedback.findByIdAndUpdate(
            feedbackId,
            { status },
            { new: true, runValidators: true }
        ).populate('userId', 'name email');

        if (!feedback) {
            throw new Error('Feedback not found');
        }

        return feedback;
    },

    /**
     * Delete a feedback entry
     */
    async deleteFeedback(feedbackId: string) {
        await connectDB();

        const feedback = await Feedback.findByIdAndDelete(feedbackId);

        if (!feedback) {
            throw new Error('Feedback not found');
        }

        return { success: true };
    }
};
