import { Types } from 'mongoose';
import dbConnect from '@/lib/db/mongoose';
import { User, MentorRoleRequest, ActivityLog, Notification } from '@/lib/models';
import { IMentorRoleRequest, RequestStatus } from '@/lib/models/MentorRoleRequest';

export interface MentorRequestResult {
    success: boolean;
    message: string;
    data?: IMentorRoleRequest;
}

/**
 * Service to handle mentor role requests and approvals
 */
export const mentorRoleRequestService = {
    /**
     * Create a new request to become a mentor
     */
    async createRequest(userId: string): Promise<MentorRequestResult> {
        try {
            await dbConnect();
            const userObjectId = new Types.ObjectId(userId);

            // 1. Fetch user and check current role
            const user = await User.findById(userObjectId);
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            if (user.role === 'mentor' || user.role === 'admin') {
                return { success: false, message: 'You already have high-level permissions' };
            }

            // 2. Check for existing pending request
            const existingRequest = await MentorRoleRequest.findOne({
                userId: userObjectId,
                status: 'pending'
            });

            if (existingRequest) {
                return { success: false, message: 'You already have a pending request' };
            }

            // 3. Create entry
            const request = new MentorRoleRequest({
                userId: userObjectId,
                status: 'pending',
                snapshotOfUserData: {
                    name: user.name,
                    email: user.email,
                    profile: user.profile
                }
            });

            await request.save();

            // 4. Activity Log
            await (ActivityLog as any).logActivity(userId, 'user', 'role_changed', {
                type: 'mentor_request_created',
                requestId: request._id
            });

            // 5. Notify Admins
            const admins = await User.find({ role: 'admin', isActive: true });
            for (const admin of admins) {
                await (Notification as any).createOrUpdate(admin._id, 'mentor_application', {
                    title: 'New Mentor Role Request',
                    message: `${user.name} has requested to become a mentor.`,
                    actionUrl: `/admin/mentor-requests`
                });
            }

            return {
                success: true,
                message: 'Request submitted successfully',
                data: request
            };
        } catch (error) {
            console.error('Error in createRequest:', error);
            return { success: false, message: 'Failed to submit request' };
        }
    },

    /**
     * Get a user's latest request
     */
    async getMyRequest(userId: string): Promise<IMentorRoleRequest | null> {
        await dbConnect();
        const userObjectId = new Types.ObjectId(userId);
        return await MentorRoleRequest.findOne({ userId: userObjectId }).sort({ createdAt: -1 });
    },

    /**
     * List all pending requests for admin review
     */
    async listPendingRequests() {
        await dbConnect();
        return await MentorRoleRequest.find({ status: 'pending' })
            .populate('userId', 'name email profile image')
            .sort({ createdAt: 1 });
    },

    /**
     * Approve a mentor role request
     */
    async approveRequest(requestId: string, adminId: string): Promise<MentorRequestResult> {
        try {
            await dbConnect();
            const request = await MentorRoleRequest.findById(requestId);

            if (!request) {
                return { success: false, message: 'Request not found' };
            }

            if (request.status !== 'pending') {
                return { success: false, message: `Request is already ${request.status}` };
            }

            // 1. Update request status
            request.status = 'approved';
            request.reviewedAt = new Date();
            request.reviewedBy = new Types.ObjectId(adminId);
            await request.save();

            // 2. Update user role
            const user = await User.findById(request.userId);
            if (user) {
                user.role = 'mentor';
                await user.save();

                // 3. Activity Log
                await (ActivityLog as any).logActivity(user._id, 'user', 'role_changed', {
                    type: 'mentor_role_approved',
                    requestId: request._id,
                    approvedBy: adminId
                });

                // 4. Notify User
                await (Notification as any).createOrUpdate(user._id, 'role_changed', {
                    title: 'Mentor Application Approved',
                    message: 'Congratulations! Your request to become a mentor has been approved.',
                    actionUrl: '/dashboard'
                });
            }

            return { success: true, message: 'Request approved successfully' };
        } catch (error) {
            console.error('Error in approveRequest:', error);
            return { success: false, message: 'Failed to approve request' };
        }
    },

    /**
     * Reject a mentor role request
     */
    async rejectRequest(requestId: string, adminId: string, reason: string): Promise<MentorRequestResult> {
        try {
            await dbConnect();
            const request = await MentorRoleRequest.findById(requestId);

            if (!request) {
                return { success: false, message: 'Request not found' };
            }

            if (request.status !== 'pending') {
                return { success: false, message: `Request is already ${request.status}` };
            }

            // 1. Update request status
            request.status = 'rejected';
            request.reviewedAt = new Date();
            request.reviewedBy = new Types.ObjectId(adminId);
            request.rejectionReason = reason;
            await request.save();

            // 2. Notify User
            await (Notification as any).createOrUpdate(request.userId, 'role_changed', {
                title: 'Mentor Application Update',
                message: `Your mentor application was not approved. Reason: ${reason}`,
                actionUrl: '/dashboard'
            });

            return { success: true, message: 'Request rejected' };
        } catch (error) {
            console.error('Error in rejectRequest:', error);
            return { success: false, message: 'Failed to reject request' };
        }
    }
};
