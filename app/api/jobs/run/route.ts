/**
 * Scheduled Jobs Cron Endpoint
 * 
 * POST /api/jobs/run
 * 
 * Protected by admin key for security
 * Triggers scheduled email jobs (inactivity, weekly digest)
 */

import { NextRequest, NextResponse } from 'next/server';
import { runScheduledJobs, checkInactiveUsers, sendWeeklyDigest, sendPlacementAlert } from '@/lib/jobs/emailScheduler';

// Admin key for cron job authentication
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key-here';

/**
 * POST /api/jobs/run
 * 
 * Query params:
 * - key: Admin secret key (required)
 * - job: Specific job to run (optional: 'all', 'inactivity', 'weekly', 'placement')
 * 
 * Body (for placement job):
 * - season: string
 * - year: number
 * - targetUserIds: string[]
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Verify admin key
        const searchParams = request.nextUrl.searchParams;
        const providedKey = searchParams.get('key');

        if (!providedKey || providedKey !== CRON_SECRET) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized: Invalid or missing admin key',
                },
                { status: 401 }
            );
        }

        // 2. Get job type
        const jobType = searchParams.get('job') || 'all';

        console.log(`[CronJob] Running job type: ${jobType}`);

        let results: any = {};

        // 3. Run requested job(s)
        switch (jobType) {
            case 'all':
                // Run all scheduled jobs
                const allResults = await runScheduledJobs();
                results = allResults.results;
                break;

            case 'inactivity':
                // Run only inactivity check
                results.inactivity = await checkInactiveUsers();
                break;

            case 'weekly':
                // Run only weekly digest
                results.weeklyDigest = await sendWeeklyDigest();
                break;

            case 'placement':
                // Run placement alert (with optional params from body)
                try {
                    const body = await request.json().catch(() => ({}));
                    results.placement = await sendPlacementAlert({
                        season: body.season,
                        year: body.year,
                        targetUserIds: body.targetUserIds,
                    });
                } catch (error) {
                    results.placement = {
                        success: false,
                        error: 'Failed to parse request body',
                    };
                }
                break;

            default:
                return NextResponse.json(
                    {
                        success: false,
                        error: `Unknown job type: ${jobType}. Valid types: all, inactivity, weekly, placement`,
                    },
                    { status: 400 }
                );
        }

        // 4. Return results
        return NextResponse.json({
            success: true,
            jobType,
            timestamp: new Date().toISOString(),
            results,
        });
    } catch (error) {
        console.error('[CronJob] Error running scheduled jobs:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/jobs/run
 * 
 * Health check endpoint
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const providedKey = searchParams.get('key');

    if (!providedKey || providedKey !== CRON_SECRET) {
        return NextResponse.json(
            {
                success: false,
                error: 'Unauthorized',
            },
            { status: 401 }
        );
    }

    return NextResponse.json({
        success: true,
        message: 'Cron job endpoint is healthy',
        availableJobs: ['all', 'inactivity', 'weekly', 'placement'],
        timestamp: new Date().toISOString(),
    });
}
