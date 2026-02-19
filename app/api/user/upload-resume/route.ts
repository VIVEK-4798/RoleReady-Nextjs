import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import User from '@/lib/models/User';
import dbConnect from '@/lib/db/mongoose';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '@/lib/uploadToCloudinary';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { user } = session;
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate request type
        if (file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Only PDF format is allowed.' }, { status: 400 });
        }

        // Validate size (5MB)
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'Resume must be smaller than 5MB.' }, { status: 400 });
        }

        await dbConnect();
        const dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Ensure profile object exists
        if (!dbUser.profile) {
            dbUser.profile = {
                education: [],
                experience: [],
                projects: [],
                certificates: [],
                achievements: []
            };
        }

        // Delete existing resume if it has a publicId
        if (dbUser.profile.resume?.publicId) {
            try {
                await deleteFromCloudinary(dbUser.profile.resume.publicId, 'raw');
                console.log('Deleted old resume:', dbUser.profile.resume.publicId);
            } catch (delError) {
                console.error('Failed to delete old resume:', delError);
            }
        }

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to Cloudinary
        const uploadResult = await uploadBufferToCloudinary(buffer, 'roleReady/resumes', { resource_type: 'raw' });

        // Update User
        dbUser.profile.resume = {
            fileUrl: uploadResult.secure_url,
            fileName: file.name,
            uploadedAt: new Date(),
            publicId: uploadResult.public_id
            // parsedText could be handled here or in a separate step
        };

        await dbUser.save();

        return NextResponse.json({
            success: true,
            resume: dbUser.profile.resume
        });

    } catch (error: any) {
        console.error('Upload resume error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
