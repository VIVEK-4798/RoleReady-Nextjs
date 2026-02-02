/**
 * Auth Middleware
 * 
 * Protects routes based on authentication status and user role.
 * Uses NextAuth.js v5 middleware pattern.
 */

export { auth as middleware } from '@/lib/auth';

export const config = {
  // Match all routes except static files and API routes that should be public
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api/health (health check)
     * - api/auth (NextAuth routes - handled by NextAuth)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/health).*)',
  ],
};
