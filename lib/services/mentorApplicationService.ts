import { Types } from 'mongoose';
import connectDB from '@/lib/db/mongoose';
import { User, MentorApplication, ActivityLog, Notification } from '@/lib/models';
import { IMentorApplication, MentorApplicationStatus } from '@/lib/models/MentorApplication';

export interface ApplicationResult {
    success: boolean;
    message: string;
    data?: any;
}

export const mentorApplicationService = {
    /**
     * Create or update a draft application
     */
    async createOrUpdateDraft(userId: string, data: Partial<IMentorApplication>): Promise<ApplicationResult> {
        try {
            await connectDB();

            const user = await User.findById(userId);
            if (!user) return { success: false, message: 'User not found' };
            if (user.role !== 'user') return { success: false, message: 'Only students can apply to be mentors' };

            const application = await MentorApplication.findOneAndUpdate(
                { userId: new Types.ObjectId(userId) },
                {
                    ...data,
                    status: 'draft' as MentorApplicationStatus,
                    userId: new Types.ObjectId(userId)
                },
                { new: true, upsert: true }
            );

            return { success: true, message: 'Draft saved', data: application };
        } catch (error) {
            console.error('Error in createOrUpdateDraft:', error);
            return { success: false, message: 'Failed to save draft' };
        }
    },

    /**
     * Record consent for role change
     */
    async recordConsent(userId: string, accepted: boolean, version: string = 'v1.0'): Promise<ApplicationResult> {
        try {
            await connectDB();
            const application = await MentorApplication.findOneAndUpdate(
                { userId: new Types.ObjectId(userId) },
                {
                    consentAccepted: accepted,
                    consentAcceptedAt: new Date(),
                    consentVersion: version
                },
                { new: true }
            );

            if (!application) return { success: false, message: 'Application not found' };

            // Audit
            await (ActivityLog as any).logActivity(userId, 'user', 'mentor_consent_given', {
                type: 'mentor_role_change_consent',
                version
            });

            return { success: true, message: 'Consent recorded successfully' };
        } catch (error) {
            console.error('Error recording consent:', error);
            return { success: false, message: 'Failed to record consent' };
        }
    },

    /**
     * Submit the application
     */
    async submitApplication(userId: string): Promise<ApplicationResult> {
        try {
            await connectDB();
            const application = await MentorApplication.findOne({ userId: new Types.ObjectId(userId) });

            if (!application) {
                return { success: false, message: 'No application found to submit' };
            }

            if (application.status === 'approved') return { success: false, message: 'Application already approved' };


            // Consent Check
            if (!application.consentAccepted) {
                return { success: false, message: 'You must check the consent box to agree to the role change terms.' };
            }

            // Basic validation
            if (!application.intent?.motivation || application.intent.motivation.length < 50) {
                return { success: false, message: 'Please provide a detailed motivation (min 50 chars)' };
            }

            application.status = 'submitted';
            application.submittedAt = new Date();
            await application.save();

            // Audit Log
            await (ActivityLog as any).logActivity(userId, 'user', 'role_changed', {
                type: 'mentor_application_submitted',
                applicationId: application._id
            });

            // Notify Admins
            const admins = await User.find({ role: 'admin', isActive: true });
            for (const admin of admins) {
                await (Notification as any).createOrUpdate(admin._id, 'mentor_application', {
                    title: 'New Mentor Application',
                    message: `${(await User.findById(userId))?.name} has submitted a detailed mentor application.`,
                    actionUrl: `/admin/mentor-applications/${application._id}`
                });
            }

            return { success: true, message: 'Application submitted successfully', data: application };
        } catch (error) {
            console.error('Error in submitApplication:', error);
            return { success: false, message: 'Failed to submit application' };
        }
    },

    /**
     * Get my application
     */
    async getMyApplication(userId: string): Promise<IMentorApplication | null> {
        await connectDB();
        return await MentorApplication.findOne({ userId: new Types.ObjectId(userId) });
    },

    /**
     * List submitted applications for admin
     */
    async listSubmittedApplications() {
        await connectDB();
        return await MentorApplication.find({ status: 'submitted' })
            .populate('userId', 'name email profile image')
            .sort({ submittedAt: 1 });
    },

    /**
     * Get application details for admin
     */
    async getApplicationById(id: string) {
        await connectDB();
        return await MentorApplication.findById(id).populate('userId', 'name email profile image');
    },

    /**
     * Approve an application
     */
    async approveApplication(id: string, adminId: string): Promise<ApplicationResult> {
        try {
            await connectDB();
            const application = await MentorApplication.findById(id);

            if (!application) return { success: false, message: 'Application not found' };
            if (application.status !== 'submitted') return { success: false, message: 'Only submitted applications can be approved' };

            application.status = 'approved';
            application.reviewedAt = new Date();
            application.reviewedBy = new Types.ObjectId(adminId);
            await application.save();

            // Update User Role
            const user = await User.findById(application.userId);
            if (user) {
                user.role = 'mentor';
                await user.save();

                // Audit Log
                await (ActivityLog as any).logActivity(user._id, 'user', 'role_changed', {
                    type: 'mentor_application_approved',
                    applicationId: application._id,
                    adminId
                });

                // Notify User
                await (Notification as any).createOrUpdate(user._id, 'role_changed', {
                    title: 'Mentor Application Approved',
                    message: 'Your application to become a mentor has been approved. Welcome to the team!',
                    actionUrl: '/dashboard'
                });
            }

            return { success: true, message: 'Application approved successfully' };
        } catch (error) {
            console.error('Error in approveApplication:', error);
            return { success: false, message: 'Failed to approve application' };
        }
    },

    /**
     * Reject an application
     */
    async rejectApplication(id: string, adminId: string, reason: string): Promise<ApplicationResult> {
        try {
            await connectDB();
            const application = await MentorApplication.findById(id);

            if (!application) return { success: false, message: 'Application not found' };
            if (application.status !== 'submitted') return { success: false, message: 'Only submitted applications can be rejected' };

            application.status = 'rejected';
            application.reviewedAt = new Date();
            application.reviewedBy = new Types.ObjectId(adminId);
            application.rejectionReason = reason;
            await application.save();

            // Notify User
            await (Notification as any).createOrUpdate(application.userId, 'role_changed', {
                title: 'Mentor Application Update',
                message: `Your mentor application was not approved. Reason: ${reason}`,
                actionUrl: '/mentor/apply'
            });

            return { success: true, message: 'Application rejected' };
        } catch (error) {
            console.error('Error in rejectApplication:', error);
            return { success: false, message: 'Failed to reject application' };
        }
    },
    /**
     * Withdraw application (Delete)
     */
    async withdrawApplication(userId: string): Promise<ApplicationResult> {
        try {
            await connectDB();
            const result = await MentorApplication.findOneAndDelete({
                userId: new Types.ObjectId(userId),
                status: { $in: ['submitted', 'draft', 'rejected'] } // Allow withdrawing submitted, draft, or rejected. Not approved.
            });

            if (!result) return { success: false, message: 'No application found to withdraw' };

            return { success: true, message: 'Application withdrawn successfully' };
        } catch (error) {
            console.error('Error in withdrawApplication:', error);
            return { success: false, message: 'Failed to withdraw application' };
        }
    }
};
