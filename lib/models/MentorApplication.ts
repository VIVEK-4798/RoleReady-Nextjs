import mongoose, { Schema, Document, Model } from 'mongoose';

export type MentorApplicationStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface IMentorApplication extends Document {
    userId: mongoose.Types.ObjectId;
    status: MentorApplicationStatus;

    professionalIdentity: {
        linkedinUrl?: string;
        githubUrl?: string;
        portfolioUrl?: string;
        companyEmail?: string;
    };

    experience: {
        currentTitle?: string;
        yearsOfExperience?: number;
        companies: string[];
        domains: string[];
    };

    expertise: {
        primarySkills: string[];
        mentoringAreas: string[];
    };

    workProof: {
        projectLinks: string[];
        achievements: string[];
    };

    intent: {
        motivation: string;
    };

    availability: {
        hoursPerWeek?: number;
        preferredMenteeLevel: 'beginner' | 'intermediate' | 'advanced';
    };

    submittedAt?: Date;
    reviewedAt?: Date;
    reviewedBy?: mongoose.Types.ObjectId;
    rejectionReason?: string;

    consentAccepted: boolean;
    consentAcceptedAt?: Date;
    consentVersion?: string;

    createdAt: Date;
    updatedAt: Date;
}

const MentorApplicationSchema = new Schema<IMentorApplication>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ['draft', 'submitted', 'approved', 'rejected'],
            default: 'draft',
            index: true,
        },

        professionalIdentity: {
            linkedinUrl: String,
            githubUrl: String,
            portfolioUrl: String,
            companyEmail: String,
        },

        experience: {
            currentTitle: String,
            yearsOfExperience: Number,
            companies: [String],
            domains: [String],
        },

        expertise: {
            primarySkills: [String],
            mentoringAreas: [String],
        },

        workProof: {
            projectLinks: [String],
            achievements: [String],
        },

        intent: {
            motivation: { type: String, required: false },
        },

        availability: {
            hoursPerWeek: Number,
            preferredMenteeLevel: {
                type: String,
                enum: ['beginner', 'intermediate', 'advanced'],
                default: 'beginner',
            },
        },

        submittedAt: Date,
        reviewedAt: Date,
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        rejectionReason: String,

        // Consent for role change
        consentAccepted: {
            type: Boolean,
            default: false,
        },
        consentAcceptedAt: Date,
        consentVersion: String,
    },
    {
        timestamps: true,
    }
);

// A user can only have one application at a time (excluding drafts maybe, but for now strict one)
MentorApplicationSchema.index({ userId: 1 }, { unique: true });

const MentorApplication: Model<IMentorApplication> =
    mongoose.models.MentorApplication ||
    mongoose.model<IMentorApplication>('MentorApplication', MentorApplicationSchema);

export default MentorApplication;
