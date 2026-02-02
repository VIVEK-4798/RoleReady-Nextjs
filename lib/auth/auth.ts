/**
 * NextAuth.js v5 Configuration
 * 
 * This is the main authentication configuration for RoleReady.
 * Uses Credentials provider for email/password authentication.
 * 
 * Features:
 * - Email/password authentication
 * - Role-based access control (user, mentor, admin)
 * - JWT-based sessions
 * - Custom session with user role and ID
 * 
 * Note: Database imports are lazy-loaded to keep this Edge Runtime compatible
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { NextAuthConfig, Session, User as NextAuthUser } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

// Extended types for our app
interface ExtendedUser extends NextAuthUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'mentor' | 'admin';
  image?: string;
}

interface ExtendedSession extends Session {
  user: ExtendedUser;
}

interface ExtendedJWT extends JWT {
  id?: string;
  role?: 'user' | 'mentor' | 'admin';
}

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const role = (credentials.role as string) || 'user';

        // Validate role
        const allowedRoles = ['user', 'mentor', 'admin'];
        if (!allowedRoles.includes(role)) {
          throw new Error('Invalid role');
        }

        try {
          // Lazy load database modules to avoid Edge Runtime issues
          const connectDB = (await import('@/lib/db/mongoose')).default;
          const { User } = await import('@/lib/models');
          
          await connectDB();

          // Find user by email and role, include password for verification
          const user = await User.findOne({
            email: email.toLowerCase(),
            role,
            isActive: true,
          }).select('+password');

          if (!user) {
            throw new Error('Invalid credentials');
          }

          // Verify password
          const isValidPassword = await user.comparePassword(password);
          if (!isValidPassword) {
            throw new Error('Invalid credentials');
          }

          // Return user object (without password)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role as 'user' | 'mentor' | 'admin',
            image: user.image,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }): Promise<ExtendedJWT> {
      // Initial sign in - add user data to token
      if (user) {
        const extUser = user as ExtendedUser;
        token.id = extUser.id;
        token.role = extUser.role;
      }
      return token as ExtendedJWT;
    },
    async session({ session, token }) {
      // Add token data to session
      const extToken = token as ExtendedJWT;
      if (extToken && session.user) {
        // Use Object.assign to safely add properties
        Object.assign(session.user, {
          id: extToken.id || '',
          role: extToken.role || 'user',
        });
      }
      return session;
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Public routes that don't require authentication
      const publicRoutes = [
        '/',
        '/login',
        '/signup',
        '/forgot-password',
        '/about',
        '/contact',
        '/pricing',
        '/terms',
      ];

      // Check if current path is public
      const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith('/api/auth')
      );

      if (isPublicRoute) {
        return true;
      }

      // Protected routes require authentication
      if (!isLoggedIn) {
        return false;
      }

      // Role-based route protection
      const adminRoutes = ['/admin'];
      const mentorRoutes = ['/mentor'];

      // Cast user to access role property added in session callback
      const userRole = (auth?.user as ExtendedUser | undefined)?.role;

      if (adminRoutes.some((route) => pathname.startsWith(route))) {
        return userRole === 'admin';
      }

      if (mentorRoutes.some((route) => pathname.startsWith(route))) {
        return userRole === 'mentor' || userRole === 'admin';
      }

      return true;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
