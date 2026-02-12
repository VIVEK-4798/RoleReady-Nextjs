/**
 * Admin User Search API
 * 
 * GET /api/admin/users/search?q=query
 * 
 * Searches users by name or email
 * Returns minimal user info for autocomplete
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

        // Search users by name or email (case-insensitive, partial match)
        // Using $or for multiple field search
        // Using $regex for partial matching
        const users = await User.find({
            role: 'user', // Only search users, not admins or mentors
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
        const results = users.map((user) => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
        }));

        return NextResponse.json({
            success: true,
            results,
            count: results.length,
        });
    } catch (error) {
        console.error('User search error:', error);
        return NextResponse.json(
            { error: 'Failed to search users' },
            { status: 500 }
        );
    }
}
