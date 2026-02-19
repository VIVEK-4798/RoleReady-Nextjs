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

        console.log('User attempting to upload avatar:', user.email);

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate MIME type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Only JPG, PNG, and WEBP images are allowed.' }, { status: 400 });
        }

        // Validate size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: 'Image must be smaller than 2MB.' }, { status: 400 });
        }

        await dbConnect();
        const dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Delete existing avatar if it's on Cloudinary
        if (dbUser.image && dbUser.image.includes('cloudinary')) {
            // Extract public_id from URL
            const urlParts = dbUser.image.split('/');
            const versionIndex = urlParts.findIndex(part => part.startsWith('v'));

            if (versionIndex !== -1) {
                const publicIdWithExt = urlParts.slice(versionIndex + 1).join('/');
                const publicId = publicIdWithExt.split('.')[0];

                try {
                    // We need to guess the folder path if it's nested
                    // The above split might be slightly incorrect if nested folders exist
                    // Better logic: use regex to extract everything after /upload/v<version>/

                    const regex = /\/upload\/v\d+\/(.+)\.[a-z]+$/;
                    const match = dbUser.image.match(regex);
                    if (match && match[1]) {
                        await deleteFromCloudinary(match[1], 'image');
                        console.log('Deleted old avatar:', match[1]);
                    }
                } catch (delError) {
                    console.error('Failed to delete old avatar:', delError);
                    // Continue with upload even if delete fails
                }
            }
        }

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to Cloudinary with optimization
        const uploadResult = await uploadBufferToCloudinary(buffer, 'roleReady/avatars', {
            resource_type: 'image',
            transformation: {
                width: 400,
                height: 400,
                crop: 'fill',
                gravity: 'face',
                quality: 'auto',
                fetch_format: 'auto'
            }
        });

        // Update User
        dbUser.image = uploadResult.secure_url;
        await dbUser.save();

        return NextResponse.json({
            success: true,
            user: {
                ...user,
                image: uploadResult.secure_url
            }
        });

    } catch (error: any) {
        console.error('Upload avatar error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
