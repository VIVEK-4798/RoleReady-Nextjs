import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Role from '@/lib/models/Role';
import { errorResponse, successResponse } from '@/lib/utils/api';

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const url = new URL(req.url);
        const query = url.searchParams.get('q');

        let roles;

        if (!query) {
            // If no query, return top 10 popular/active roles
            // For now, we'll just return first 10 active roles sorted alphabetically
            roles = await Role.find({ isActive: true })
                .select('id name')
                .sort({ name: 1 })
                .limit(10)
                .lean();
        } else {
            // Sanitize query: escape special regex characters to prevent ReDoS
            const sanitizedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // Case-insensitive regex search
            const searchRegex = new RegExp(sanitizedQuery, 'i');

            roles = await Role.find({
                isActive: true,
                name: { $regex: searchRegex }
            })
                .select('id name')
                .sort({ name: 1 })
                .limit(15) // Limit to 15 results
                .lean();
        }

        // Transform _id to id if needed (lean queries return _id)
        const formattedRoles = roles.map(role => ({
            id: role._id.toString(),
            name: role.name
        }));

        return successResponse(formattedRoles);

    } catch (error) {
        console.error('[API] Role Search Error:', error);
        return errorResponse('Internal Server Error', 500);
    }
}
