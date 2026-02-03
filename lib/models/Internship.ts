/**
 * Internship Model
 * 
 * Schema for internship listings.
 */

import mongoose from 'mongoose';

export interface IInternship {
  title: string;
  company: string;
  category?: mongoose.Types.ObjectId;
  city: string;
  stipend: string;
  duration: string;
  type: string; // Full-time, Part-time, Remote, etc.
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

const internshipSchema = new mongoose.Schema<IInternship>(
  {
    title: {
      type: String,
      required: [true, 'Internship title is required'],
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
    stipend: {
      type: String,
      required: [true, 'Stipend is required'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
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
internshipSchema.index({ isActive: 1, isFeatured: 1 });
internshipSchema.index({ city: 1, isActive: 1 });
internshipSchema.index({ category: 1, isActive: 1 });

export default mongoose.models.Internship ||
  mongoose.model<IInternship>('Internship', internshipSchema);
