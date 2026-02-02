/**
 * API Response Utilities
 * 
 * Standardized response helpers for Next.js API routes.
 */

import { NextResponse } from 'next/server';
import type { ApiResponse, PaginatedResponse } from '@/types';

/**
 * Create a successful response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string,
  status = 400,
  message?: string
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      error,
      message,
    },
    { status }
  );
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  },
  message?: string
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      pagination,
      message,
    },
    { status: 200 }
  );
}

/**
 * Common error responses
 */
export const errors = {
  notFound: (resource = 'Resource') =>
    errorResponse(`${resource} not found`, 404),
  
  unauthorized: (message = 'Unauthorized') =>
    errorResponse(message, 401),
  
  forbidden: (message = 'Forbidden') =>
    errorResponse(message, 403),
  
  badRequest: (message = 'Bad request') =>
    errorResponse(message, 400),
  
  validationError: (message: string) =>
    errorResponse(message, 422, 'Validation failed'),
  
  serverError: (message = 'Internal server error') =>
    errorResponse(message, 500),
  
  conflict: (message = 'Resource already exists') =>
    errorResponse(message, 409),
};

// Aliases for convenience
export const success = successResponse;

/**
 * Generic error handler for API routes
 * Logs the error and returns appropriate response
 */
export function handleError(error: unknown): NextResponse<ApiResponse<null>> {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    // Check for MongoDB duplicate key error
    if (error.message.includes('duplicate key') || error.message.includes('E11000')) {
      return errors.conflict('Resource already exists');
    }
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      return errors.validationError(error.message);
    }
    
    // Check for CastError (invalid ObjectId)
    if (error.name === 'CastError') {
      return errors.badRequest('Invalid ID format');
    }
    
    return errors.serverError(error.message);
  }
  
  return errors.serverError('An unexpected error occurred');
}

/**
 * Extract pagination parameters from URL search params
 */
export function getPaginationParams(url: string | URL): {
  page: number;
  limit: number;
  skip: number;
} {
  const searchParams = new URL(url).searchParams;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

/**
 * Build pagination metadata for response
 */
export function buildPaginationMeta(
  totalItems: number,
  page: number,
  limit: number
): {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} {
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
