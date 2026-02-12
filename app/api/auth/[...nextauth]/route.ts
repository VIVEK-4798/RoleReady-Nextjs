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
import { NextRequest } from 'next/server';

// Wrap handlers with logging
export async function GET(request: NextRequest) {
    console.log('🔵 NextAuth GET:', request.nextUrl.pathname + request.nextUrl.search);
    const response = await handlers.GET(request);
    console.log('🔵 NextAuth GET Response:', response.status);
    return response;
}

export async function POST(request: NextRequest) {
    console.log('🔵 NextAuth POST:', request.nextUrl.pathname + request.nextUrl.search);
    const response = await handlers.POST(request);
    console.log('🔵 NextAuth POST Response:', response.status);
    return response;
}
