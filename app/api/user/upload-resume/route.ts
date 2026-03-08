import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { User, Resume, ActivityLog } from '@/lib/models';
import dbConnect from '@/lib/db/mongoose';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '@/lib/uploadToCloudinary';
import { markEvaluationsOutdated } from '@/lib/services/evaluationService';

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

        // Update User Profile
        dbUser.profile.resume = {
            fileUrl: uploadResult.secure_url,
            fileName: file.name,
            uploadedAt: new Date(),
            publicId: uploadResult.public_id
        };

        // Sync with Resume Collection (for versioning and detailed tracking)
        // 1. Get next version number
        const lastResume = await Resume.findOne({ userId: dbUser._id })
            .sort({ version: -1 })
            .select('version');
        const nextVersion = (lastResume?.version || 0) + 1;

        // 2. Create resume record
        const resumeRecord = await Resume.create({
            userId: dbUser._id,
            filename: uploadResult.public_id,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            url: uploadResult.secure_url,
            status: 'pending',
            isActive: true,
            version: nextVersion,
        });

        // 3. Log activity
        await ActivityLog.logActivity(dbUser._id.toString(), 'user', 'resume_uploaded', {
            resumeId: resumeRecord._id.toString(),
            version: nextVersion,
        });

        // 4. Mark evaluations as outdated
        await markEvaluationsOutdated(dbUser._id.toString(), ['readiness', 'roadmap', 'ats', 'report']);

        await dbUser.save();

        // 🚀 CRITICAL: Trigger parsing immediately so it's ready for ATS scoring
        const { performResumeParsing } = await import('@/lib/services/resumeParser');
        try {
            // We await it here to ensure it's done for the immediate UX, 
            // but we wrap in try-catch to ensure the upload itself doesn't fail if parsing does
            await performResumeParsing(resumeRecord, dbUser._id.toString());
        } catch (parseError) {
            console.error('Immediate parsing failed:', parseError);
            // We continue anyway, the user might try parsing again manually
        }

        return NextResponse.json({
            success: true,
            resume: dbUser.profile.resume
        });

    } catch (error: any) {
        console.error('Upload resume error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
