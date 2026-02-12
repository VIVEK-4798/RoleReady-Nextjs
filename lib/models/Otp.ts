/**
 * OTP (One-Time Password) Model
 * 
 * Stores temporary OTPs for password reset and email verification.
 * OTPs are hashed for security and automatically expire.
 * 
 * Security Features:
 * - OTP stored as hash (never plain text)
 * - Max 5 verification attempts
 * - Auto-expiry via TTL index
 * - One-time use enforcement
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOtp {
  email: string;
  otpHash: string; // Hashed OTP (never store plain text)
  purpose: 'password-reset' | 'email-verification';
  expiresAt: Date;
  used: boolean;
  attempts: number; // Track failed verification attempts
  createdAt: Date;
  updatedAt: Date;
}

export interface IOtpDocument extends IOtp, Document { }

const OtpSchema = new Schema<IOtpDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: [true, 'OTP hash is required'],
    },
    purpose: {
      type: String,
      enum: {
        values: ['password-reset', 'email-verification'],
        message: '{VALUE} is not a valid purpose',
      },
      required: [true, 'Purpose is required'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
      index: { expires: 0 }, // TTL index - auto-delete when expired
    },
    used: {
      type: Boolean,
      default: false,
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookups
OtpSchema.index({ email: 1, purpose: 1, used: 1 });
OtpSchema.index({ email: 1, purpose: 1, createdAt: -1 });

const Otp: Model<IOtpDocument> =
  mongoose.models.Otp || mongoose.model<IOtpDocument>('Otp', OtpSchema);

export default Otp;
