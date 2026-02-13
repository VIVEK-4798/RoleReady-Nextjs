/**
 * Client-side Auth Utilities
 * 
 * Helper functions for client-side authentication operations.
 * Only use in client components ('use client').
 */

'use client';

import { signIn as nextAuthSignIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/types';

/**
 * Sign in with Google OAuth
 * 
 * Performs Google OAuth sign-in and redirects based on user role.
 * New users are created with 'user' role and email verified status.
 * 
 * @returns Promise that resolves when sign-in is complete
 */
export async function signInWithGoogle(
  onError?: (error: string) => void
): Promise<void> {
  try {
    console.log('CLIENT: signInWithGoogle - Starting...');
    // Let NextAuth handle the full OAuth flow including redirects
    // This will redirect to Google, then back to /api/auth/callback/google
    // NextAuth will then redirect to the callbackUrl or default page
    await nextAuthSignIn('google', {
      callbackUrl: '/role-redirect',
    });
    // Note: Code after this won't execute because the page will redirect
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Google sign-in failed';
    console.error('CLIENT: signInWithGoogle - Exception:', error);
    onError?.(errorMessage);
  }
}

/**
 * Sign in with LinkedIn OAuth
 * 
 * Performs LinkedIn OAuth sign-in and redirects based on user role.
 * New users are created with 'user' role and email verified status.
 * 
 * @returns Promise that resolves when sign-in is complete
 */
export async function signInWithLinkedIn(
  onError?: (error: string) => void
): Promise<void> {
  try {
    console.log('CLIENT: signInWithLinkedIn - Starting...');
    // Let NextAuth handle the full OAuth flow including redirects
    // This will redirect to LinkedIn, then back to /api/auth/callback/linkedin
    // NextAuth will then redirect to the callbackUrl or default page
    await nextAuthSignIn('linkedin', {
      callbackUrl: '/role-redirect',
    });
    // Note: Code after this won't execute because the page will redirect
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'LinkedIn sign-in failed';
    console.error('CLIENT: signInWithLinkedIn - Exception:', error);
    onError?.(errorMessage);
  }
}

/**
 * User-friendly error message for OAuth errors
 */
function getOAuthErrorMessage(error: string): string {
  const errorMap: Record<string, string> = {
    'OAuthSignin': 'Failed to connect to OAuth provider. Please try again.',
    'OAuthCallback': 'OAuth sign-in was cancelled or failed. Please try again.',
    'OAuthCreateAccount': 'Could not create account with OAuth. Please try again.',
    'EmailSignInError': 'Email sign-in failed. Please try again.',
    'CredentialsSignin': 'Invalid credentials. Please try again.',
    'AccessDenied': 'Access denied. You may not have permission to access this service.',
  };

  return errorMap[error] || 'Authentication failed. Please try again.';
}


/**
 * Determine redirect URL based on user role
 * Call this on a redirect page after Google OAuth completes
 */
export async function getRedirectUrlByRole(userRole: UserRole): Promise<string> {
  switch (userRole) {
    case 'admin':
      return '/admin';
    case 'mentor':
      return '/mentor';
    case 'user':
    default:
      return '/dashboard';
  }
}

