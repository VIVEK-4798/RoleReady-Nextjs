/**
 * Auth Utilities
 * 
 * Server-side utilities for authentication and authorization.
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { UserRole } from '@/types';

// Extended user type that includes role
interface ExtendedUser {
  id?: string;
  email?: string | null;
  name?: string | null;
  role?: UserRole;
  image?: string | null;
}

/**
 * Get the current session on the server side
 * Use in Server Components and API routes
 */
export async function getServerSession() {
  return await auth();
}

/**
 * Get the current user from session
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<ExtendedUser | null> {
  const session = await auth();
  return (session?.user as ExtendedUser) ?? null;
}

/**
 * Require authentication - redirect to login if not authenticated
 * Use in Server Components that require authentication
 */
export async function requireAuth(redirectTo = '/login'): Promise<ExtendedUser> {
  const session = await auth();
  
  if (!session?.user) {
    redirect(redirectTo);
  }
  
  return session.user as ExtendedUser;
}

/**
 * Require specific role(s) - redirect if user doesn't have the role
 * Use in Server Components that require specific roles
 */
export async function requireRole(
  roles: UserRole | UserRole[],
  redirectTo = '/dashboard'
): Promise<ExtendedUser> {
  const user = await requireAuth();
  
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  if (!user.role || !allowedRoles.includes(user.role)) {
    redirect(redirectTo);
  }
  
  return user;
}

/**
 * Check if user has a specific role
 * Returns false if not authenticated or doesn't have the role
 */
export async function hasRole(roles: UserRole | UserRole[]): Promise<boolean> {
  const session = await auth();
  
  if (!session?.user) {
    return false;
  }
  
  const user = session.user as ExtendedUser;
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return !!user.role && allowedRoles.includes(user.role);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}

// ============================================================================
// API Route Authorization Helpers
// ============================================================================

import { errors } from '@/lib/utils/api';

/**
 * Result type for API auth checks
 */
export interface ApiAuthResult {
  user: ExtendedUser | null;
  error: ReturnType<typeof errors.unauthorized> | null;
}

/**
 * Require authentication for API routes - returns error response if not authenticated
 */
export async function requireAuthApi(): Promise<ApiAuthResult> {
  const session = await auth();
  
  if (!session?.user) {
    return {
      user: null,
      error: errors.unauthorized('Authentication required'),
    };
  }
  
  return { user: session.user as ExtendedUser, error: null };
}

/**
 * Require specific role(s) for API routes - returns error response if unauthorized
 */
export async function requireRoleApi(
  allowedRoles: UserRole | UserRole[]
): Promise<ApiAuthResult> {
  const { user, error } = await requireAuthApi();
  
  if (error) {
    return { user: null, error };
  }
  
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  if (!user?.role || !roles.includes(user.role)) {
    return {
      user: null,
      error: errors.forbidden(`Requires ${roles.join(' or ')} role`),
    };
  }
  
  return { user, error: null };
}

/**
 * Require mentor role for API routes (mentor or admin)
 */
export async function requireMentorApi(): Promise<ApiAuthResult> {
  return requireRoleApi(['mentor', 'admin']);
}

/**
 * Require admin role for API routes
 */
export async function requireAdminApi(): Promise<ApiAuthResult> {
  return requireRoleApi('admin');
}
