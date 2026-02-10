/**
 * Auth Library Index
 * 
 * Central export point for authentication utilities.
 */

export { auth, signIn, signOut, handlers } from './auth';
export {
  getServerSession,
  getCurrentUser,
  requireAuth,
  requireRole,
  hasRole,
  isAuthenticated,
} from './utils';
export { signInWithGoogle, getRedirectUrlByRole } from './client';

