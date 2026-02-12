/**
 * Debug API Endpoint
 * 
 * This endpoint helps debug Google OAuth issues by checking:
 * - Environment variables
 * - MongoDB connection
 * - Session status
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Check environment variables
        const envCheck = {
            GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
            AUTH_SECRET: !!process.env.AUTH_SECRET,
            AUTH_URL: process.env.AUTH_URL,
            MONGODB_URI: !!process.env.MONGODB_URI,
        };

        // Check session
        const session = await auth();

        // Check MongoDB connection
        let dbStatus = 'unknown';
        try {
            const connectDB = (await import('@/lib/db/mongoose')).default;
            await connectDB();
            dbStatus = 'connected';
        } catch (error) {
            dbStatus = `error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: envCheck,
            database: dbStatus,
            session: {
                authenticated: !!session,
                user: session?.user ? {
                    email: session.user.email,
                    name: session.user.name,
                    // @ts-ignore
                    role: session.user.role,
                } : null,
            },
        });
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        }, { status: 500 });
    }
}
