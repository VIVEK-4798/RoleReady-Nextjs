/**
 * Health Check & Database Connection Test
 * 
 * GET /api/health
 * 
 * Returns the application health status and database connection state.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';

export async function GET() {
  try {
    // Attempt to connect to the database
    await connectDB();

    return NextResponse.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
