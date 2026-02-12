/**
 * DemoSession Model
 * 
 * Stores temporary demo sessions for the landing page demo experience.
 * 
 * KEY CHARACTERISTICS:
 * - Completely isolated from real user data
 * - Auto-expires after 24 hours via TTL index
 * - No relation to User collection
 * - Used only for demo readiness calculations
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

// Demo skill interface
export interface IDemoSkill {
  skillId: string;
  skillName: string;
  level?: string;
}

// DemoSession document interface
export interface IDemoSession extends Document {
  sessionId: string;
  selectedRole?: string;
  selectedRoleName?: string;
  demoSkills: IDemoSkill[];
  demoReadinessScore?: number;
  demoBreakdown?: {
    skillId: string;
    skillName: string;
    status: 'met' | 'missing';
    weight: number;
  }[];
  createdAt: Date;
  expiresAt: Date;
}

const DemoSkillSchema = new Schema<IDemoSkill>(
  {
    skillId: { type: String, required: true },
    skillName: { type: String, required: true },
    level: { type: String, default: 'intermediate' },
  },
  { _id: false }
);

const DemoBreakdownSchema = new Schema(
  {
    skillId: { type: String, required: true },
    skillName: { type: String, required: true },
    status: { type: String, enum: ['met', 'missing'], required: true },
    weight: { type: Number, default: 1 },
  },
  { _id: false }
);

const DemoSessionSchema = new Schema<IDemoSession>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    selectedRole: {
      type: String,
      default: null,
    },
    selectedRoleName: {
      type: String,
      default: null,
    },
    demoSkills: {
      type: [DemoSkillSchema],
      default: [],
    },
    demoReadinessScore: {
      type: Number,
      default: null,
    },
    demoBreakdown: {
      type: [DemoBreakdownSchema],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      // TTL index: MongoDB will automatically delete documents when expiresAt is reached
      // Index is defined below using DemoSessionSchema.index() to avoid duplication
    },
  },
  {
    timestamps: false, // We manage createdAt manually
    collection: 'demo_sessions',
  }
);

// Create TTL index on expiresAt field
// MongoDB will automatically remove expired documents
DemoSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create a new session with 24-hour expiry
DemoSessionSchema.statics.createSession = async function (sessionId: string) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

  const session = new this({
    sessionId,
    expiresAt,
    demoSkills: [],
  });

  return session.save();
};

// Static method to find valid (non-expired) session
DemoSessionSchema.statics.findValidSession = async function (sessionId: string) {
  return this.findOne({
    sessionId,
    expiresAt: { $gt: new Date() },
  });
};

// Model interface with static methods
interface IDemoSessionModel extends Model<IDemoSession> {
  createSession(sessionId: string): Promise<IDemoSession>;
  findValidSession(sessionId: string): Promise<IDemoSession | null>;
}

// Export model (handle hot reloading in development)
const DemoSession: IDemoSessionModel =
  (mongoose.models.DemoSession as IDemoSessionModel) ||
  mongoose.model<IDemoSession, IDemoSessionModel>('DemoSession', DemoSessionSchema);

export default DemoSession;
