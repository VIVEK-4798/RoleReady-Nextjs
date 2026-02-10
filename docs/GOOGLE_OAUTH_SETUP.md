/**
 * GOOGLE OAUTH IMPLEMENTATION GUIDE
 * 
 * This document explains the Google OAuth integration for RoleReady.
 */

# Google OAuth Login Implementation

## Overview
This implementation allows users to sign in with their Google account. New users are automatically registered with:
- Role: "user" (default for OAuth registrations)
- Email verified: true
- Provider: Google

## Setup Steps

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Google+ API"
4. Go to "Credentials" → Create OAuth 2.0 Client ID (Web Application)
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
6. Copy Client ID and Client Secret

### 2. Environment Variables
Create `.env.local` from `.env.example` and add:
```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000
```

To generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## How It Works

### Authentication Flow

1. **User clicks "Continue with Google"**
   - Located on `/login` and `/signup` pages
   - Calls `signInWithGoogle()` from `lib/auth/client.ts`

2. **NextAuth OAuth Flow**
   - User is redirected to Google login
   - After Google authentication, redirects to `/api/auth/callback/google`

3. **signIn Callback (`lib/auth/auth.ts`)**
   - Checks if user email exists in database
   - If exists: Logs them in (updates image if changed)
   - If new: Creates user account with:
     ```typescript
     {
       name: from Google,
       email: from Google,
       image: from Google,
       role: 'user',
       emailVerified: new Date(),
       password: null,
       isActive: true
     }
     ```

4. **JWT & Session**
   - JWT callback attaches: `id`, `role`, `name`, `email`, `image`
   - Session callback exposes user data to frontend

5. **Role-Based Redirect**
   - User redirected to `/role-redirect` page
   - Page reads session and redirects based on role:
     - Admin → `/admin`
     - Mentor → `/mentor`
     - User → `/dashboard`

## Database Schema

### User Model Updates
- `password`: Now optional (null for OAuth users)
- `emailVerified`: Set to current date for OAuth users
- May be extended later with `provider` field if needed

```typescript
{
  name: String (required),
  email: String (required, unique),
  password: String | null (optional for OAuth),
  emailVerified: Date | null (set for OAuth),
  role: 'user' | 'mentor' | 'admin',
  image: String (from Google),
  isActive: Boolean,
  // ... other fields
}
```

## Code Changes

### 1. `lib/auth/auth.ts`
- Added Google provider import
- Added signIn callback for OAuth handling
- Added redirect callback
- Added `allowDangerousEmailAccountLinking: true` for Google provider

### 2. `lib/auth/client.ts` (NEW FILE)
- `signInWithGoogle()`: Handles Google sign-in with error handling
- `getGoogleErrorMessage()`: User-friendly error messages
- `getRedirectUrlByRole()`: Determines redirect URL by role

### 3. `app/role-redirect/page.tsx` (NEW FILE)
- Standalone page for post-OAuth redirect
- Reads session and redirects based on role

### 4. UI Components

#### `app/(auth)/login/LoginForm.tsx`
- Added Google OAuth button (top of form)
- Added divider between social and email login
- Error handling for Google sign-in

#### `app/(auth)/signup/SignupForm.tsx`
- Added Google OAuth button (top of form)
- Added divider between social and email signup
-Note: Google signup skips role selection (defaults to 'user')

### 5. Type Updates

#### `types/index.ts`
- Made `password` field optional: `string | null`
- Added `emailVerified` field: `Date | null`

#### `lib/models/User.ts`
- Updated password field to optional
- Added emailVerified field
- Updated pre-save middleware to only hash non-null passwords
- Updated comparePassword to return false for OAuth users

## Features

### Error Handling
- Graceful error messages for OAuth failures
- Non-intrusive error display on login/signup
- Console logging for debugging

### Security
- Email uniqueness enforced at database level
- Password hashing only for credentials users
- NextAuth session strategy: JWT (secure, stateless)
- Email verification set automatically for OAuth users

### User Experience
- Seamless one-click login with Google
- Automatic account creation
- Role-based redirect to appropriate dashboard
- No password required for Google accounts
- Profile image from Google displayed in app

## Testing

### Local Testing
1. `npm run dev` to start the app
2. Go to `/login` or `/signup`
3. Click "Continue with Google"
4. Sign in with your Google account
5. Should be redirected to `/dashboard`

### Test Cases
- New Google account → Creates user and redirects
- Existing Google account → Logs in and redirects
- Existing email (different provider) → Creates as different record
- Invalid Google credentials → Shows error message

## Troubleshooting

### "Invalid client_id" error
- Check GOOGLE_CLIENT_ID in `.env.local`
- Verify on Google Cloud Console

### "redirect_uri_mismatch" error
- Ensure redirect URI in Google Cloud matches:
  - Production: `https://yourdomain.com/api/auth/callback/google`
  - Development: `http://localhost:3000/api/auth/callback/google`

### "Invalid NEXTAUTH_URL" error
- Check `.env.local` has NEXTAUTH_URL set correctly
- Should match current app URL

### User created but not logging in
- Check MongoDB connection in `.env.local`
- Verify user document in database
- Check JWT callback is properly attaching role

## Future Enhancements

1. Add `provider` field to User model to track auth method
2. Support multiple auth methods per email (account linking)
3. Add GitHub OAuth (similar pattern)
4. Email verification flow for credentials users
5. Social account unlinking

## References
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
