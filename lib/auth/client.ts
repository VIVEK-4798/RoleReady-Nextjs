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
    const result = await nextAuthSignIn('google', {
      redirect: false,
    });

    console.log('CLIENT: signInWithGoogle - Result:', result);

    if (result?.error) {
      console.error('CLIENT: signInWithGoogle - Error from NextAuth:', result.error);
      const errorMessage = getGoogleErrorMessage(result.error);
      onError?.(errorMessage);
      return;
    }

    if (result?.ok) {
      console.log('CLIENT: signInWithGoogle - Authentication successful');
      // Use a small delay to ensure session is fully established
      setTimeout(() => {
        console.log('CLIENT: signInWithGoogle - Redirecting to /role-redirect');
        window.location.href = '/role-redirect';
      }, 500);
      return;
    }

    console.error('CLIENT: signInWithGoogle - Unexpected result:', result);
    onError?.('Authentication failed. Please try again.');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Google sign-in failed';
    console.error('CLIENT: signInWithGoogle - Exception:', error);
    onError?.(errorMessage);
  }
}

/**
 * User-friendly error message for Google OAuth errors
 */
function getGoogleErrorMessage(error: string): string {
  const errorMap: Record<string, string> = {
    'OAuthSignin': 'Failed to connect to Google. Please try again.',
    'OAuthCallback': 'Google sign-in was cancelled or failed. Please try again.',
    'OAuthCreateAccount': 'Could not create account with Google. Please try again.',
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
export async function getRedirectUrlByRole(userRole: UserRole): string {
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
