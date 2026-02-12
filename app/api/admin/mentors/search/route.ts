/**
 * Admin Mentor Search API
 * 
 * GET /api/admin/mentors/search?q=query
 * 
 * Searches mentors by name or email
 * Returns minimal mentor info for autocomplete
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import { checkAdminAuth } from '@/lib/utils/adminAuth';

const SEARCH_LIMIT = 10;

export async function GET(request: NextRequest) {
    try {
        // Check admin authorization
        const authResult = await checkAdminAuth();
        if (!authResult.authorized) {
            return NextResponse.json(
                { error: authResult.error || 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get search query
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');

        if (!query || query.trim().length === 0) {
            return NextResponse.json(
                { error: 'Search query is required' },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDB();

        // Search mentors by name or email (case-insensitive, partial match)
        // Using $or for multiple field search
        // Using $regex for partial matching
        const mentors = await User.find({
            role: 'mentor', // Only search mentors
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
            ],
        })
            .select('_id name email') // Only return necessary fields
            .limit(SEARCH_LIMIT)
            .lean() // Return plain objects for better performance
            .exec();

        // Format results
        const results = mentors.map((mentor) => ({
            id: mentor._id.toString(),
            name: mentor.name,
            email: mentor.email,
        }));

        return NextResponse.json({
            success: true,
            results,
            count: results.length,
        });
    } catch (error) {
        console.error('Mentor search error:', error);
        return NextResponse.json(
            { error: 'Failed to search mentors' },
            { status: 500 }
        );
    }
}
