
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IATSScore {
    userId: mongoose.Types.ObjectId;
    roleId: mongoose.Types.ObjectId;
    overallScore: number;
    breakdown: {
        relevance: number;
        contextDepth: number;
        structure: number;
        impact: number;
    };
    missingKeywords: string[];
    suggestions: string[];
    calculatedAt: Date;
}

export interface IATSScoreDocument extends IATSScore, Document {
    createdAt: Date;
    updatedAt: Date;
}

const ATSScoreSchema = new Schema<IATSScoreDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
        overallScore: { type: Number, required: true },
        breakdown: {
            relevance: { type: Number, required: true },
            contextDepth: { type: Number, required: true },
            structure: { type: Number, required: true },
            impact: { type: Number, required: true },
        },
        missingKeywords: [{ type: String }],
        suggestions: [{ type: String }],
        calculatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Index for quick lookup
ATSScoreSchema.index({ userId: 1, roleId: 1 }, { unique: true });

const ATSScore: Model<IATSScoreDocument> = mongoose.models.ATSScore || mongoose.model<IATSScoreDocument>('ATSScore', ATSScoreSchema);

export default ATSScore;
