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
  ],
  callbacks: {
    async signIn({ user, profile, account, email: emailObj }) {
      console.log('=== SIGNIN CALLBACK START ===');
      console.log('signIn - user:', { id: user.id, email: user.email, name: user.name });
      console.log('signIn - account provider:', account?.provider);
      
      // Only process OAuth providers
      if (account?.provider === 'google') {
        try {
          // Lazy load database modules
          const connectDB = (await import('@/lib/db/mongoose')).default;
          const { User } = await import('@/lib/models');
          
          await connectDB();
          console.log('signIn - Database connected');

          const email = user.email?.toLowerCase();

          if (!email) {
            console.error('signIn - No email provided');
            return false;
          }

          console.log('signIn - Processing Google email:', email);

          // Check if user exists
          let existingUser = await User.findOne({
            email,
            isActive: true,
          });

          if (existingUser) {
            console.log('signIn - User exists in DB:', { id: existingUser._id.toString(), email: existingUser.email, role: existingUser.role });
            // User exists, update image if different
            if (user.image && existingUser.image !== user.image) {
              existingUser.image = user.image;
              await existingUser.save();
              console.log('signIn - Updated user image');
            }
            
            // Update user ID for NextAuth
            user.id = existingUser._id.toString();
            console.log('signIn - Returning existing user:', { id: user.id, email: user.email });
            return true;
          }

          // Create new user with Google data
          console.log('signIn - Creating new user from Google');
          const newUser = new User({
            name: user.name || profile?.name || 'User',
            email,
            password: null,
            image: user.image,
            role: 'user', // Default role for new Google users
            emailVerified: new Date(),
            isActive: true,
            profile: {},
          });

          await newUser.save();
          console.log('signIn - New user created:', { id: newUser._id.toString(), email: newUser.email, role: newUser.role });

          // Update user ID for NextAuth
          user.id = newUser._id.toString();
          console.log('signIn - Returning new user:', { id: user.id, email: user.email });
          console.log('=== SIGNIN CALLBACK END ===');
          return true;
        } catch (error) {
          console.error('signIn - Google OAuth error:', error);
          return false;
        }
      }

      console.log('=== SIGNIN CALLBACK END (credentials) ===');
      // Credentials provider - already handled in authorize
      return true;
    },
    async jwt({ token, user, trigger, session }): Promise<ExtendedJWT> {
      console.log('=== JWT CALLBACK START ===');
      console.log('jwt - Input token:', { id: token.id, role: token.role, email: token.email, sub: token.sub });
      console.log('jwt - User provided:', !!user);
      if (user) {
        console.log('jwt - User object:', { id: user.id, email: user.email, name: user.name });
      }
      
      // Always fetch from database to ensure we have the latest role
      const email = token.email || (user?.email);
      
      if (email) {
        try {
          console.log('jwt - Fetching user from DB with email:', email);
          const connectDB = (await import('@/lib/db/mongoose')).default;
          const { User } = await import('@/lib/models');
          
          await connectDB();
          
          const dbUser = await User.findOne({
            email: email.toLowerCase(),
            isActive: true,
          });
          
          if (dbUser) {
            console.log('jwt - User found in DB:', { id: dbUser._id.toString(), role: dbUser.role, name: dbUser.name });
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
        console.log('jwt - No role found, defaulting to user');
        token.role = 'user';
      }
      
      // Handle session updates (e.g., after profile image upload)
      if (trigger === 'update' && session?.image) {
        token.image = session.image;
        console.log('jwt - Session image updated');
      }
      
      console.log('jwt - Final token:', { id: token.id, role: token.role, email: token.email });
      console.log('=== JWT CALLBACK END ===');
      return token as ExtendedJWT;
    },
    async session({ session, token }) {
      console.log('=== SESSION CALLBACK START ===');
      console.log('session - Token:', { id: token.id, role: token.role, email: token.email });
      console.log('session - User before:', session.user);
      
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
        
        console.log('session - User after:', { id: session.user.id, role: (session.user as any).role, email: session.user.email });
      } else {
        console.warn('session - No user in session');
      }
      
      console.log('=== SESSION CALLBACK END ===');
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
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
