import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { SocialLinksService, SocialPlatform } from '@/services/socialLinksService';

/**
 * Handle GET /api/profile/social-link
 * Returns all social links for the current user.
 */
export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const socialLinks = await SocialLinksService.getSocialLinks(session.user.id);
        return NextResponse.json({ success: true, socialLinks });
    } catch (error: any) {
        console.error('API [GET] social-link error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * Handle PATCH /api/profile/social-link
 * Updates or adds a social link for a specific platform.
 */
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { platform, url } = body;

        if (!platform || !url) {
            return NextResponse.json({ error: 'Platform and URL are required' }, { status: 400 });
        }

        // platform validation
        const validPlatforms: SocialPlatform[] = ['linkedin', 'github', 'twitter', 'portfolio'];
        if (!validPlatforms.includes(platform as SocialPlatform)) {
            return NextResponse.json({ error: 'Invalid platform selection' }, { status: 400 });
        }

        const socialLinks = await SocialLinksService.updateSocialLink(
            session.user.id,
            platform as SocialPlatform,
            url
        );

        return NextResponse.json({ success: true, socialLinks });
    } catch (error: any) {
        console.error('API [PATCH] social-link error:', error);
        return NextResponse.json({ error: error.message || 'Validation Failed' }, { status: 400 });
    }
}

/**
 * Handle DELETE /api/profile/social-link
 * Removes a specific social link.
 */
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { platform } = body;

        if (!platform) {
            return NextResponse.json({ error: 'Platform is required' }, { status: 400 });
        }

        const validPlatforms: SocialPlatform[] = ['linkedin', 'github', 'twitter', 'portfolio'];
        if (!validPlatforms.includes(platform as SocialPlatform)) {
            return NextResponse.json({ error: 'Invalid platform selection' }, { status: 400 });
        }

        const socialLinks = await SocialLinksService.removeSocialLink(
            session.user.id,
            platform as SocialPlatform
        );

        return NextResponse.json({ success: true, socialLinks });
    } catch (error: any) {
        console.error('API [DELETE] social-link error:', error);
        return NextResponse.json({ error: error.message || 'Deletion Failed' }, { status: 400 });
    }
}
