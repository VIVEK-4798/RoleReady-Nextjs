
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import User from '@/lib/models/User';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Fetch full user details from DB
        const dbUser = await User.findById(user.id);

        if (!dbUser) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Mock department and lastLogin since they aren't in User schema yet
        const profileData = {
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            createdAt: dbUser.createdAt,
            lastLogin: dbUser.updatedAt, // Mocking last login as updated at
            mobile: dbUser.mobile || '',
            department: 'Administration', // Mock department
            avatar: dbUser.image,
        };

        return NextResponse.json({
            success: true,
            data: profileData,
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name, mobile, department } = body;

        await dbConnect();

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            user.id,
            {
                name,
                mobile,
                // Department is not in schema, so we ignore it for DB update but acknowledge it
            },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                name: updatedUser.name,
                mobile: updatedUser.mobile,
                department: department,
            },
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
