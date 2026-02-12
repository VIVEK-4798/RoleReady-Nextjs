/**
 * Admin Authorization Guard
 * 
 * Middleware to check if user is an admin.
 * Used in API routes to protect admin-only endpoints.
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export interface AuthResult {
    authorized: boolean;
    userId?: string;
    role?: string;
    error?: string;
}

/**
 * Check if current user is an admin
 * 
 * @returns Authorization result with user info or error
 */
export async function checkAdminAuth(): Promise<AuthResult> {
    try {
        const session = await auth();

        if (!session) {
            return {
                authorized: false,
                error: 'Not authenticated',
            };
        }

        if (!session.user) {
            return {
                authorized: false,
                error: 'User not found in session',
            };
        }

        // Type guard to check if user has required properties
        const user = session.user as { id?: string; role?: string; email?: string; name?: string };

        if (!user.role) {
            return {
                authorized: false,
                error: 'User role not found in session',
            };
        }

        if (user.role !== 'admin') {
            return {
                authorized: false,
                error: 'Insufficient permissions. Admin access required.',
            };
        }

        if (!user.id) {
            return {
                authorized: false,
                error: 'User ID not found in session',
            };
        }

        return {
            authorized: true,
            userId: user.id,
            role: user.role,
        };
    } catch (error) {
        console.error('Admin auth check error:', error);
        return {
            authorized: false,
            error: 'Authentication error',
        };
    }
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
    return NextResponse.json(
        {
            success: false,
            error: message,
        },
        { status: 403 }
    );
}

/**
 * Require admin authentication for API route
 * Returns user info if authorized, or sends error response
 * 
 * Usage:
 * ```typescript
 * const authResult = await requireAdmin();
 * if (!authResult.authorized) {
 *   return unauthorizedResponse(authResult.error);
 * }
 * // Continue with admin logic...
 * ```
 */
export async function requireAdmin(): Promise<AuthResult> {
    return await checkAdminAuth();
}
