/**
 * GOOGLE OAUTH DEBUGGING GUIDE
 * Follow these steps to diagnose the login issue
 */

# Google OAuth Login Debugging Guide

## What I Fixed

I've added comprehensive console logging to trace the entire OAuth flow:

### 1. **signIn Callback** (`lib/auth/auth.ts`)
- Logs when Google OAuth starts
- Logs email being processed
- Shows if user exists in DB or is being created
- Logs final user object being returned

### 2. **JWT Callback** (`lib/auth/auth.ts`)
- Logs when token is created
- Logs database lookup
- Shows role being set
- Logs final token

### 3. **Session Callback** (`lib/auth/auth.ts`)
- Logs the token data
- Shows session.user before and after
- Logs role assignment

### 4. **signInWithGoogle Function** (`lib/auth/client.ts`)
- Logs when Google signin starts
- Logs the result from NextAuth
- Shows redirect trigger

### 5. **Role Redirect Page** (`app/role-redirect/page.tsx`)
- Logs session status
- Shows if user is authenticated
- Logs role and redirect path

---

## How to Debug

### Step 1: Open Browser DevTools
1. Go to http://localhost:3000/login
2. Press **F12** to open Developer Tools
3. Click on **Console** tab
4. **Keep the console open** while you test

### Step 2: Open Terminal
1. Look at the terminal where `npm run dev` is running
2. This will show server-side logs

### Step 3: Test Google Login
1. Click "Continue with Google" button
2. Sign in with your Google account
3. **Watch BOTH console and terminal**

---

## What to Look For

### SUCCESS - You Should See:

**In Browser Console (client-side logs):**
```
CLIENT: signInWithGoogle - Starting...
CLIENT: signInWithGoogle - Result: {ok: true}
CLIENT: signInWithGoogle - Authentication successful
CLIENT: signInWithGoogle - Redirecting to /role-redirect
REDIRECT: useEffect triggered
REDIRECT: Session status: authenticated
REDIRECT: Session data: {user: {...}}
REDIRECT: User authenticated
REDIRECT: Redirecting to: /dashboard
```

**In Terminal (server-side logs):**
```
=== SIGNIN CALLBACK START ===
signIn - user: {id: "...", email: "...", name: "..."}
signIn - account provider: google
signIn - Database connected
signIn - Processing Google email: user@example.com
signIn - User exists in DB: {id: "...", email: "...", role: "user"}
signIn - Returning existing user: {id: "...", email: "..."}
=== SIGNIN CALLBACK END ===

=== JWT CALLBACK START ===
jwt - Input token: {id: "...", role: undefined, email: "..."}
jwt - User provided: false
jwt - Fetching user from DB with email: user@example.com
jwt - User found in DB: {id: "...", role: "user", name: "..."}
jwt - Final token: {id: "...", role: "user", email: "..."}
=== JWT CALLBACK END ===

=== SESSION CALLBACK START ===
session - Token: {id: "...", role: "user", email: "..."}
session - User before: {email: "...", name: "...", image: "..."}
session - User after: {id: "...", role: "user", email: "..."}
=== SESSION CALLBACK END ===
```

---

## PROBLEM - If You See

### Problem 1: Session is Unauthenticated
```
REDIRECT: Session status: unauthenticated
REDIRECT: No session found, redirecting to login
```

**This means:** signIn callback is failing or returning false

**Check terminal for:**
```
signIn - Google OAuth error: ...
```

**Solutions:**
- Check MongoDB connection string in `.env.local`
- Verify Google credentials are correct
- Check if MongoDB is running

---

### Problem 2: signIn Never Appears in Terminal
**This means:** Google OAuth provider might not be configured correctly

**Check:**
- Are `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` set in `.env.local`?
- Did you restart the dev server after setting env vars?

---

### Problem 3: JWT Callback Shows No Role
```
jwt - No role found, defaulting to user
```

**This means:** User exists but role isn't being found

**Check:**
- Is user created in MongoDB with `isActive: true` and `role: "user"`?
- Check MongoDB directly using MongoDB Compass or CLI

---

### Problem 4: Session Updated but Still Unauthenticated
```
=== SESSION CALLBACK END ===
(followed by)
REDIRECT: Session status: unauthenticated
```

**This means:** NextAuth's session strategy might be misconfigured

**Solution:**
- Verify `session: { strategy: 'jwt' }` is set in auth.ts

---

## Next Steps

1. **Test the flow:**
   - Keep browser console open
   - Keep terminal visible
   - Click "Continue with Google"
   - Watch the logs flow

2. **Copy relevant logs** from both console and terminal

3. **If it fails:**
   - Take a screenshot of the error logs
   - Check which callback failed
   - Follow the problem section above

---

## Quick Checklist

- [ ] MongoDB connection working
- [ ] Google credentials in `.env.local`
- [ ] Changed `AUTH_SECRET` and `AUTH_URL` (not NEXTAUTH_*)
- [ ] Dev server restarted after env changes
- [ ] No other `npm run dev` instances running
- [ ] Testing in incognito/private mode
- [ ] Browser console open during test

---

## If Still Stuck

1. **Provide the complete logs** from:
   - Browser console
   - Terminal output

2. **Include:**
   - Screenshots of errors
   - MongoDB user document (check if created)
   - `.env.local` values (without secrets)

The detailed logging will help identify exactly where the flow breaks!
