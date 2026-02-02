/**
 * useAuth Hook
 * 
 * Client-side hook for authentication state and actions.
 * Uses NextAuth.js session management.
 */

'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export type UserRole = 'user' | 'mentor' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
}

export interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session?.user;

  // Type assertion to handle NextAuth session structure
  const sessionUser = session?.user as { id?: string; name?: string | null; email?: string | null; role?: UserRole; image?: string | null } | undefined;

  const user: AuthUser | null = sessionUser
    ? {
        id: sessionUser.id || '',
        name: sessionUser.name || '',
        email: sessionUser.email || '',
        role: sessionUser.role || 'user',
        image: sessionUser.image || undefined,
      }
    : null;

  const login = useCallback(
    async (
      email: string,
      password: string,
      role: UserRole = 'user'
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const result = await signIn('credentials', {
          email,
          password,
          role,
          redirect: false,
        });

        if (result?.error) {
          return { success: false, error: result.error };
        }

        // Redirect based on role
        const redirectPath =
          role === 'admin'
            ? '/admin'
            : role === 'mentor'
            ? '/mentor'
            : '/dashboard';
        
        router.push(redirectPath);
        router.refresh();

        return { success: true };
      } catch (error) {
        console.error('Login error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Login failed',
        };
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  }, [router]);

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!user) return false;
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(user.role);
    },
    [user]
  );

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    hasRole,
  };
}

export default useAuth;
