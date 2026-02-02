/**
 * Resume Model
 * 
 * Stores user resume files and parsed data.
 * Supports multiple resume versions with skill extraction.
 */

import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Parsed skill from resume
interface ParsedSkill {
  name: string;
  confidence: number; // 0-100, how confident the parser is
  context?: string; // Where in resume the skill was found
}

// Resume interface
export interface IResume {
  userId: Types.ObjectId;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number; // in bytes
  url?: string; // Storage URL (S3, etc.)
  localPath?: string; // Local storage path
  
  // Parsing status
  status: 'pending' | 'processing' | 'completed' | 'failed';
  parsedAt?: Date;
  parseError?: string;
  
  // Extracted data
  extractedData?: {
    rawText?: string;
    skills: ParsedSkill[];
    experience?: {
      company?: string;
      title?: string;
      duration?: string;
    }[];
    education?: {
      institution?: string;
      degree?: string;
      year?: string;
    }[];
    summary?: string;
  };
  
  // Skill sync status
  skillsSynced: boolean;
  skillsSyncedAt?: Date;
  
  isActive: boolean; // Current resume
  version: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IResumeDocument extends IResume, Document {}

const ParsedSkillSchema = new Schema({
  name: { type: String, required: true },
  confidence: { type: Number, default: 50 },
  context: String,
}, { _id: false });

const ResumeSchema = new Schema<IResumeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
      enum: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    },
    size: {
      type: Number,
      required: true,
    },
    url: String,
    localPath: String,
    
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    parsedAt: Date,
    parseError: String,
    
    extractedData: {
      rawText: String,
      skills: [ParsedSkillSchema],
      experience: [{
        company: String,
        title: String,
        duration: String,
      }],
      education: [{
        institution: String,
        degree: String,
        year: String,
      }],
      summary: String,
    },
    
    skillsSynced: {
      type: Boolean,
      default: false,
    },
    skillsSyncedAt: Date,
    
    isActive: {
      type: Boolean,
      default: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.localPath; // Don't expose local path
        return ret;
      },
    },
  }
);

// Compound index for user's resumes
ResumeSchema.index({ userId: 1, isActive: 1 });
ResumeSchema.index({ userId: 1, version: -1 });

// Set previous resumes as inactive when new one is uploaded
ResumeSchema.pre('save', async function (this: IResumeDocument) {
  if (this.isNew && this.isActive) {
    await mongoose.model('Resume').updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isActive: false }
    );
  }
});

// Virtual for extracted skill count
ResumeSchema.virtual('extractedSkillCount').get(function (this: IResumeDocument) {
  return this.extractedData?.skills?.length || 0;
});

export const Resume: Model<IResumeDocument> =
  mongoose.models.Resume || mongoose.model<IResumeDocument>('Resume', ResumeSchema);
