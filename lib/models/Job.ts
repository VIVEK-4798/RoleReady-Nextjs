/**
 * Job Model
 * 
 * Schema for job listings.
 */

import mongoose from 'mongoose';

export interface IJob {
  title: string;
  company: string;
  category?: mongoose.Types.ObjectId;
  city: string;
  salary: string;
  experience: string;
  type: string; // Full-time, Part-time, Remote, Contract, etc.
  workDetail: string;
  description?: string;
  requirements?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new mongoose.Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    salary: {
      type: String,
      required: [true, 'Salary is required'],
    },
    experience: {
      type: String,
      required: [true, 'Experience is required'],
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
    },
    workDetail: {
      type: String,
      required: [true, 'Work details are required'],
    },
    description: {
      type: String,
    },
    requirements: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    contactPhone: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
jobSchema.index({ isActive: 1, isFeatured: 1 });
jobSchema.index({ city: 1, isActive: 1 });
jobSchema.index({ category: 1, isActive: 1 });

export default mongoose.models.Job ||
  mongoose.model<IJob>('Job', jobSchema);
