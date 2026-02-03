/**
 * Category Model
 * 
 * Schema for internship and job categories.
 */

import mongoose from 'mongoose';

export interface ICategory {
  name: string;
  type: 'internship' | 'job';
  colorClass?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['internship', 'job'],
    },
    colorClass: {
      type: String,
      default: '#3B82F6', // Default blue color
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
categorySchema.index({ type: 1, isActive: 1 });
categorySchema.index({ name: 1, type: 1 }, { unique: true });

export default mongoose.models.Category ||
  mongoose.model<ICategory>('Category', categorySchema);
