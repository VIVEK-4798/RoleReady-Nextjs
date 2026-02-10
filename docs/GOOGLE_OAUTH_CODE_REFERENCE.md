/**
 * AUTH.TS - GOOGLE PROVIDER SETUP
 * Key code snippets from lib/auth/auth.ts
 */

// Import Google Provider
import Google from 'next-auth/providers/google';

// Add to providers array
Google({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  allowDangerousEmailAccountLinking: true,
}),

// SignIn Callback (handles OAuth user creation)
async signIn({ user, profile, account, email: emailObj }) {
  if (account?.provider === 'google') {
    try {
      const connectDB = (await import('@/lib/db/mongoose')).default;
      const { User } = await import('@/lib/models');
      
      await connectDB();

      const email = user.email?.toLowerCase();

      if (!email) {
        console.error('Google OAuth: No email provided');
        return false;
      }

      // Check if user exists
      let existingUser = await User.findOne({
        email,
        isActive: true,
      });

      if (existingUser) {
        // User exists, update image if different
        if (user.image && existingUser.image !== user.image) {
          existingUser.image = user.image;
          await existingUser.save();
        }
        
        user.id = existingUser._id.toString();
        user.role = existingUser.role;
        return true;
      }

      // Create new user with Google data
      const newUser = new User({
        name: user.name || profile?.name || 'User',
        email,
        password: null,
        image: user.image,
        role: 'user',
        emailVerified: new Date(),
        isActive: true,
        profile: {},
      });

      await newUser.save();

      user.id = newUser._id.toString();
      user.role = 'user';

      return true;
    } catch (error) {
      console.error('Google OAuth signIn error:', error);
      return false;
    }
  }

  // Credentials provider - already handled in authorize
  return true;
},

---

/**
 * CLIENT.TS - GOOGLE OAUTH FUNCTIONS
 * lib/auth/client.ts
 */

'use client';

import { signIn as nextAuthSignIn } from 'next-auth/react';
import type { UserRole } from '@/types';

export async function signInWithGoogle(
  onError?: (error: string) => void
): Promise<void> {
  try {
    const result = await nextAuthSignIn('google', {
      redirect: false,
    });

    if (result?.error) {
      const errorMessage = getGoogleErrorMessage(result.error);
      onError?.(errorMessage);
      return;
    }

    window.location.href = '/role-redirect';
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Google sign-in failed';
    onError?.(errorMessage);
  }
}

function getGoogleErrorMessage(error: string): string {
  const errorMap: Record<string, string> = {
    'OAuthSignin': 'Failed to connect to Google. Please try again.',
    'OAuthCallback': 'Google sign-in was cancelled or failed. Please try again.',
    'OAuthCreateAccount': 'Could not create account with Google. Please try again.',
    'AccessDenied': 'Access denied. You may not have permission to access this service.',
  };

  return errorMap[error] || 'Authentication failed. Please try again.';
}

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

---

/**
 * ROLE REDIRECT PAGE
 * app/role-redirect/page.tsx
 */

'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function RoleRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (!session?.user) {
      router.push('/login');
      return;
    }

    const user = session.user as { role?: string };
    const role = user.role || 'user';

    const redirectPath =
      role === 'admin'
        ? '/admin'
        : role === 'mentor'
        ? '/mentor'
        : '/dashboard';

    router.push(redirectPath);
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <svg
          className="animate-spin h-8 w-8 text-[#5693C1]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="mt-4 text-gray-600">Redirecting you...</p>
      </div>
    </div>
  );
}

---

/**
 * LOGIN FORM - GOOGLE BUTTON
 * In app/(auth)/login/LoginForm.tsx
 */

import { signInWithGoogle } from '@/lib/auth/client';

// In component state:
const [isGoogleLoading, setIsGoogleLoading] = useState(false);

// Handler:
const handleGoogleSignIn = async () => {
  setError('');
  setIsGoogleLoading(true);
  
  try {
    await signInWithGoogle((errorMsg) => {
      setError(errorMsg);
      setIsGoogleLoading(false);
    });
  } catch (err) {
    setError('Google sign-in failed. Please try again.');
    console.error('Google sign-in error:', err);
    setIsGoogleLoading(false);
  }
};

// In JSX - Google Button:
<button
  type="button"
  onClick={handleGoogleSignIn}
  disabled={isGoogleLoading || isLoading}
  className="w-full py-3 px-4 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:ring-offset-2 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
>
  {isGoogleLoading ? (
    <>
      <svg className="animate-spin h-5 w-5 text-gray-700" {...} />
      Signing in...
    </>
  ) : (
    <>
      {/* Google Icon SVG */}
      Continue with Google
    </>
  )}
</button>

// Divider:
<div className="relative py-2">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-gray-300" />
  </div>
  <div className="relative flex justify-center text-sm">
    <span className="px-2 bg-white text-gray-500">Or continue with email</span>
  </div>
</div>

---

/**
 * USER MODEL UPDATES
 * lib/models/User.ts
 */

// Password field - now optional for OAuth users
password: {
  type: String,
  minlength: [6, 'Password must be at least 6 characters'],
  select: false,
  default: null,
},

// New field - for OAuth email verification
emailVerified: {
  type: Date,
  default: null,
},

// Pre-save middleware - updated
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  const bcrypt = await import('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// comparePassword method - updated
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

---

/**
 * ENVIRONMENT VARIABLES
 * .env.local (copy from .env.example)
 */

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MONGODB_URI=mongodb://localhost:27017/roleready

---

/**
 * TYPE UPDATES
 * types/index.ts
 */

export interface IUser {
  // ... other fields
  password?: string | null;  // Optional for OAuth
  emailVerified?: Date | null;  // Set for OAuth users
  // ... rest of fields
}

