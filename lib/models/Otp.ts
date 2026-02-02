/**
 * OTP (One-Time Password) Model
 * 
 * Stores temporary OTPs for password reset and email verification.
 * OTPs automatically expire after a configurable time.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOtp {
  email: string;
  otp: string;
  role: 'user' | 'mentor' | 'admin';
  purpose: 'password-reset' | 'email-verification';
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOtpDocument extends IOtp, Document {}

const OtpSchema = new Schema<IOtpDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'mentor', 'admin'],
      required: true,
    },
    purpose: {
      type: String,
      enum: ['password-reset', 'email-verification'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index - document deleted when expiresAt is reached
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for lookup
OtpSchema.index({ email: 1, role: 1, purpose: 1 });

const Otp: Model<IOtpDocument> =
  mongoose.models.Otp || mongoose.model<IOtpDocument>('Otp', OtpSchema);

export default Otp;
