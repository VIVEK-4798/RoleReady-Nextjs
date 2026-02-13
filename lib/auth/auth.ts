/**
 * NextAuth.js v5 Configuration
 * 
 * This is the main authentication configuration for RoleReady.
 * Uses Credentials provider for email/password authentication and Google OAuth.
 * 
 * Features:
 * - Email/password authentication
 * - Google OAuth authentication
 * - Role-based access control (user, mentor, admin)
 * - JWT-based sessions
 * - Custom session with user role and ID
 * 
 * Note: Database imports are lazy-loaded to keep this Edge Runtime compatible
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import LinkedIn from 'next-auth/providers/linkedin';
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
  image?: string;
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
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: 'openid profile email',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, profile, account, email: emailObj }) {
      // Only process OAuth providers (Google and LinkedIn)
      if (account?.provider === 'google' || account?.provider === 'linkedin') {
        try {
          // Lazy load database modules
          const connectDB = (await import('@/lib/db/mongoose')).default;
          const { User } = await import('@/lib/models');

          await connectDB();

          const email = user.email?.toLowerCase();

          if (!email) {
            return false;
          }

          // Check if user exists
          let existingUser = await User.findOne({
            email,
            isActive: true,
          });

          if (existingUser) {
            // Update provider-specific ID if not set
            if (account.provider === 'linkedin' && !existingUser.linkedinId && account.providerAccountId) {
              existingUser.linkedinId = account.providerAccountId;
              await existingUser.save();
            }

            // Update image if different
            if (user.image && existingUser.image !== user.image) {
              existingUser.image = user.image;
              await existingUser.save();
            }

            // Update user ID for NextAuth
            user.id = existingUser._id.toString();
            return true;
          }

          // Create new user with OAuth data
          const newUserData: Record<string, unknown> = {
            name: user.name || profile?.name || 'User',
            email,
            password: null,
            image: user.image,
            role: 'user', // Default role for new OAuth users
            emailVerified: new Date(),
            isActive: true,
            profile: {},
          };

          // Add provider-specific ID
          if (account.provider === 'linkedin' && account.providerAccountId) {
            newUserData.linkedinId = account.providerAccountId;
          }

          const newUser = new User(newUserData);

          await newUser.save();

          // Trigger welcome email (async, non-blocking)
          import('@/lib/email/emailEventService').then(({ triggerEmailEvent }) => {
            triggerEmailEvent({
              userId: newUser._id.toString(),
              event: 'WELCOME_USER',
            }).catch(err => console.error('[Auth] Welcome email failed:', err));
          }).catch(err => console.error('[Auth] Email module import failed:', err));

          // Update user ID for NextAuth
          user.id = newUser._id.toString();;
          return true;
        } catch (error) {
          console.error('=== SIGNIN CALLBACK ERROR ===');
          console.error(`signIn - ${account.provider} OAuth error:`, error);
          console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
          console.error('Error message:', error instanceof Error ? error.message : String(error));
          console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
          console.error('=== END SIGNIN CALLBACK ERROR ===');
          return false;
        }
      }

      // Credentials provider - already handled in authorize
      return true;
    },
    async jwt({ token, user, trigger, session }): Promise<ExtendedJWT> {
      // Always fetch from database to ensure we have the latest role
      const email = token.email || (user?.email);

      if (email) {
        try {
          const connectDB = (await import('@/lib/db/mongoose')).default;
          const { User } = await import('@/lib/models');

          await connectDB();

          const dbUser = await User.findOne({
            email: email.toLowerCase(),
            isActive: true,
          });

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role as 'user' | 'mentor' | 'admin';
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.image = dbUser.image;
          } else {
            console.warn('jwt - User not found in DB for email:', email);
          }
        } catch (error) {
          console.error('jwt - Database fetch error:', error);
        }
      }

      // Fallback: if still no role, default to user
      if (!token.role) {
        token.role = 'user';
      }

      // Handle session updates (e.g., after profile image upload)
      if (trigger === 'update' && session?.image) {
        token.image = session.image;
      }

      return token as ExtendedJWT;
    },
    async session({ session, token }) {

      const extToken = token as ExtendedJWT;
      if (session.user) {
        // Ensure all properties are set
        session.user.id = extToken.id || '';
        session.user.email = extToken.email || session.user.email || '';
        session.user.name = extToken.name || session.user.name || '';
        // @ts-ignore - Add role property
        session.user.role = extToken.role || 'user';
        // @ts-ignore - Add image property
        session.user.image = extToken.image || session.user.image;

      } else {
        console.warn('session - No user in session');
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
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
        '/role-redirect', // Post-OAuth redirect route
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
  debug: true, // Enable debug mode to see detailed logs
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
