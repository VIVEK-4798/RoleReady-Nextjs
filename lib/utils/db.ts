/**
 * Database Utilities
 * 
 * Helper functions for common database operations.
 */

import { Types } from 'mongoose';

/**
 * Convert string ID to MongoDB ObjectId
 * Returns null if invalid
 */
export function toObjectId(id: string | Types.ObjectId): Types.ObjectId | null {
  if (id instanceof Types.ObjectId) {
    return id;
  }
  
  if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
    return new Types.ObjectId(id);
  }
  
  return null;
}

/**
 * Check if a string is a valid MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

/**
 * Create a pagination object for API responses
 */
export function createPagination(
  page: number,
  limit: number,
  totalItems: number
) {
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    currentPage: page,
    totalPages,
    totalItems,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Parse pagination params from query string
 */
export function parsePaginationParams(
  searchParams: URLSearchParams,
  defaults = { page: 1, limit: 10 }
) {
  const page = Math.max(1, parseInt(searchParams.get('page') || String(defaults.page), 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || String(defaults.limit), 10)));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}
