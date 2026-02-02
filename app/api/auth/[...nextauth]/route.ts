/**
 * NextAuth.js API Route Handler
 * 
 * Handles all /api/auth/* routes:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/session
 * - /api/auth/csrf
 * - /api/auth/providers
 * - /api/auth/callback/*
 */

import { handlers } from '@/lib/auth';

export const GET = handlers.GET;
export const POST = handlers.POST;
